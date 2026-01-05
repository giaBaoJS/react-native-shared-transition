import UIKit
import Foundation
import NitroModules

/**
 * Native module for shared element transitions on iOS
 *
 * Provides Fabric-safe APIs for:
 * - View snapshot capture using CALayer rendering
 * - Precise layout measurement in screen coordinates
 * - Element visibility control
 *
 * Uses modern iOS APIs (iOS 13+):
 * - UIGraphicsImageRenderer for efficient rendering
 * - UIWindowScene for window access
 * - No deprecated UIManager/findNodeHandle APIs
 */
class HybridSharedTransitionModule: HybridSharedTransitionModuleSpec {

  // MARK: - Properties

    /// Cached snapshots by nativeID (URI -> file path)
    private var cachedSnapshots: [String: URL] = [:]

    /// Hidden elements by nativeID
    private var hiddenElements: Set<String> = []

    /// Clone views by view tag
    private var cloneViews: [Int: UIView] = [:]

    /// Counter for clone view tags
    private var cloneViewTagCounter: Int = 1000

  // MARK: - HybridSharedTransitionModuleSpec Implementation

    func measureNode(nativeId: String) throws -> Promise<SharedElementNodeData> {
        return Promise.async {
        guard let view = self.findViewByNativeID(nativeId) else {
                throw NSError(
              domain: "SharedTransition",
              code: 404,
              userInfo: [NSLocalizedDescriptionKey: "View not found: \(nativeId)"]
            )
        }

            // Get frame in window coordinates (screen-relative)
            guard let window = view.window else {
                throw NSError(
                    domain: "SharedTransition",
                    code: 500,
                    userInfo: [NSLocalizedDescriptionKey: "View not in window hierarchy: \(nativeId)"]
                )
            }

            let frameInWindow = view.convert(view.bounds, to: window)

            // Detect content type
            let contentType = self.detectContentType(view)

            // Capture snapshot
            let snapshotUri = try self.captureSnapshotSync(view: view, nativeId: nativeId)

            let layout = SharedElementLayout(
                x: Double(frameInWindow.origin.x),
                y: Double(frameInWindow.origin.y),
                width: Double(frameInWindow.width),
                height: Double(frameInWindow.height)
          )

            return SharedElementNodeData(
                layout: layout,
                contentType: contentType,
                snapshotUri: snapshotUri
            )
    }
  }

    func captureSnapshot(nativeId: String) throws -> Promise<String> {
        return Promise.async {
        guard let view = self.findViewByNativeID(nativeId) else {
                throw NSError(
              domain: "SharedTransition",
              code: 404,
              userInfo: [NSLocalizedDescriptionKey: "View not found: \(nativeId)"]
            )
            }

            return try self.captureSnapshotSync(view: view, nativeId: nativeId)
        }
    }

    func prepareTransition(
        startNodeId: String,
        endNodeId: String,
        config: TransitionConfig
    ) throws -> Promise<PreparedTransitionData> {
        return Promise.async {
            // Find both views
            guard let startView = self.findViewByNativeID(startNodeId) else {
                throw NSError(
                    domain: "SharedTransition",
                    code: 404,
                    userInfo: [NSLocalizedDescriptionKey: "Start view not found: \(startNodeId)"]
                )
            }

            guard let endView = self.findViewByNativeID(endNodeId) else {
                throw NSError(
                    domain: "SharedTransition",
                    code: 404,
                    userInfo: [NSLocalizedDescriptionKey: "End view not found: \(endNodeId)"]
                )
            }

            // Get window for coordinate conversion
            guard let window = startView.window else {
                throw NSError(
              domain: "SharedTransition",
              code: 500,
                    userInfo: [NSLocalizedDescriptionKey: "Views not in window hierarchy"]
            )
            }

            // Measure layouts
            let startFrame = startView.convert(startView.bounds, to: window)
            let endFrame = endView.convert(endView.bounds, to: window)

            // Capture snapshots
            let startSnapshotUri = try self.captureSnapshotSync(view: startView, nativeId: startNodeId)
            let endSnapshotUri = try self.captureSnapshotSync(view: endView, nativeId: endNodeId)

            // Detect content types
            let startContentType = self.detectContentType(startView)
            let endContentType = self.detectContentType(endView)

            let startLayout = SharedElementLayout(
                x: Double(startFrame.origin.x),
                y: Double(startFrame.origin.y),
                width: Double(startFrame.width),
                height: Double(startFrame.height)
            )

            let endLayout = SharedElementLayout(
                x: Double(endFrame.origin.x),
                y: Double(endFrame.origin.y),
                width: Double(endFrame.width),
                height: Double(endFrame.height)
            )

            return PreparedTransitionData(
                startLayout: startLayout,
                endLayout: endLayout,
                startSnapshotUri: startSnapshotUri,
                endSnapshotUri: endSnapshotUri,
                startContentType: startContentType,
                endContentType: endContentType
            )
        }
  }

    func createCloneView(nativeId: String) throws -> Promise<Double> {
        return Promise.async {
            guard let originalView = self.findViewByNativeID(nativeId) else {
                throw NSError(
                    domain: "SharedTransition",
                    code: 404,
                    userInfo: [NSLocalizedDescriptionKey: "View not found: \(nativeId)"]
                )
            }

            guard let window = originalView.window else {
                throw NSError(
                    domain: "SharedTransition",
                    code: 500,
                    userInfo: [NSLocalizedDescriptionKey: "View not in window"]
                )
            }

            // Create snapshot view
            let snapshotView = originalView.snapshotView(afterScreenUpdates: false)
                ?? UIView(frame: originalView.bounds)

            // Position in window coordinates
            let frameInWindow = originalView.convert(originalView.bounds, to: window)
            snapshotView.frame = frameInWindow

            // Generate tag
            let viewTag = self.cloneViewTagCounter
            self.cloneViewTagCounter += 1

            // Store and add to window
            self.cloneViews[viewTag] = snapshotView
            window.addSubview(snapshotView)

            return Double(viewTag)
        }
    }

    func destroyCloneView(viewTag: Double) throws {
        let tag = Int(viewTag)

        if let cloneView = cloneViews[tag] {
            cloneView.removeFromSuperview()
            cloneViews.removeValue(forKey: tag)
        }
    }

    func setNodeHidden(nativeId: String, hidden: Bool) throws {
        guard let view = findViewByNativeID(nativeId) else {
            return // Silently ignore if view not found
        }

        DispatchQueue.main.async {
            view.isHidden = hidden

            if hidden {
                self.hiddenElements.insert(nativeId)
            } else {
                self.hiddenElements.remove(nativeId)
      }
    }
  }

  func cleanup() throws {
        // Remove all cached snapshots
        for (_, url) in cachedSnapshots {
        try? FileManager.default.removeItem(at: url)
      }
    cachedSnapshots.removeAll()

        // Show all hidden elements
        for nativeId in hiddenElements {
            if let view = findViewByNativeID(nativeId) {
                view.isHidden = false
            }
        }
        hiddenElements.removeAll()

        // Remove all clone views
        for (_, view) in cloneViews {
            view.removeFromSuperview()
        }
        cloneViews.removeAll()
  }

  // MARK: - Private Helpers

    /// Capture snapshot synchronously (must be called on main thread)
    private func captureSnapshotSync(view: UIView, nativeId: String) throws -> String {
        // Check if already cached
        if let cachedUrl = cachedSnapshots[nativeId] {
            return cachedUrl.absoluteString
        }

        // Ensure view has valid size
        guard view.bounds.width > 0 && view.bounds.height > 0 else {
            throw NSError(
                domain: "SharedTransition",
                code: 400,
                userInfo: [NSLocalizedDescriptionKey: "View has zero size"]
            )
        }

        // Use UIGraphicsImageRenderer for modern, efficient rendering
        let renderer = UIGraphicsImageRenderer(bounds: view.bounds)
        let image = renderer.image { context in
            // Use layer rendering for accurate capture including subviews
            view.layer.render(in: context.cgContext)
        }

        // Generate unique filename
        let safeNativeId = nativeId.replacingOccurrences(of: "/", with: "_")
        let fileName = "shared_transition_\(safeNativeId)_\(Date().timeIntervalSince1970).png"
        let fileURL = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)

        // Save as PNG (lossless, supports transparency)
        guard let pngData = image.pngData() else {
            throw NSError(
                domain: "SharedTransition",
                code: 500,
                userInfo: [NSLocalizedDescriptionKey: "Failed to create PNG data"]
            )
        }

        try pngData.write(to: fileURL)

        // Cache the URL
        cachedSnapshots[nativeId] = fileURL

        return fileURL.absoluteString
    }

    /// Detect the content type of a view
    private func detectContentType(_ view: UIView) -> SharedElementContentType {
        // Check if it's an image view
        if view is UIImageView {
            return .image
        }

        // Check if it contains an image view as direct child
        for subview in view.subviews {
            if subview is UIImageView {
                return .image
            }
        }

        // Default to snapshot
        return .snapshot
    }

  /// Find a view by its nativeID prop (Fabric-safe)
  private func findViewByNativeID(_ nativeId: String) -> UIView? {
        // Get key window from connected scenes (iOS 13+)
        guard let windowScene = UIApplication.shared.connectedScenes
      .compactMap({ $0 as? UIWindowScene })
            .first(where: { $0.activationState == .foregroundActive }),
              let window = windowScene.windows.first(where: { $0.isKeyWindow }) else {
            // Fallback for older iOS or edge cases
            return findViewByNativeIDFallback(nativeId)
    }

    return findView(withNativeID: nativeId, in: window)
  }

    /// Fallback window access
    private func findViewByNativeIDFallback(_ nativeId: String) -> UIView? {
        guard let window = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) else {
            return nil
        }
        return findView(withNativeID: nativeId, in: window)
    }

    /// Recursive view search
  private func findView(withNativeID nativeId: String, in view: UIView) -> UIView? {
        // Check accessibilityIdentifier (React Native maps nativeID to this)
    if view.accessibilityIdentifier == nativeId {
      return view
    }

        // Check React Native's nativeID property using KVC (safe)
        if let viewNativeID = (view as AnyObject).value(forKeyPath: "reactTag") as? String,
         viewNativeID == nativeId {
        return view
    }

        // Search subviews recursively
    for subview in view.subviews {
      if let found = findView(withNativeID: nativeId, in: subview) {
        return found
      }
    }

    return nil
  }
}
