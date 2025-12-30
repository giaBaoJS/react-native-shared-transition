import UIKit
import Foundation
import NitroModules

/**
 * Native module for shared element transitions on iOS
 *
 * Provides Fabric-safe APIs for:
 * - View snapshot capture using CALayer
 * - Precise layout measurement
 * - Element registration and tracking
 *
 * Does NOT use deprecated APIs (UIManager, findNodeHandle).
 */
class HybridSharedTransitionModule: HybridSharedTransitionModuleSpec {

  // MARK: - Properties

  /// Registered elements by nativeID
  private var registeredElements: [String: String] = [:]

  /// Cached snapshots by nativeID
  private var cachedSnapshots: [String: String] = [:]

  // MARK: - HybridSharedTransitionModuleSpec Implementation

  func captureSnapshot(nativeId: String) throws -> Promise<SnapshotData> {
    return Promise { resolver in
      DispatchQueue.main.async {
        guard let view = self.findViewByNativeID(nativeId) else {
          resolver.reject(
            NSError(
              domain: "SharedTransition",
              code: 404,
              userInfo: [NSLocalizedDescriptionKey: "View not found: \(nativeId)"]
            )
          )
          return
        }

        // Capture snapshot using CALayer
        let renderer = UIGraphicsImageRenderer(bounds: view.bounds)
        let image = renderer.image { context in
          view.layer.render(in: context.cgContext)
        }

        // Save to temporary file
        let fileName = "snapshot_\(nativeId.replacingOccurrences(of: "/", with: "_"))_\(Date().timeIntervalSince1970).png"
        let fileURL = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)

        do {
          try image.pngData()?.write(to: fileURL)

          let snapshot = SnapshotData(
            uri: fileURL.absoluteString,
            width: Double(view.bounds.width),
            height: Double(view.bounds.height)
          )

          // Cache the snapshot URI
          self.cachedSnapshots[nativeId] = fileURL.absoluteString

          resolver.resolve(snapshot)
        } catch {
          resolver.reject(error)
        }
      }
    }
  }

  func measureLayout(nativeId: String) throws -> Promise<NativeLayout> {
    return Promise { resolver in
      DispatchQueue.main.async {
        guard let view = self.findViewByNativeID(nativeId) else {
          resolver.reject(
            NSError(
              domain: "SharedTransition",
              code: 404,
              userInfo: [NSLocalizedDescriptionKey: "View not found: \(nativeId)"]
            )
          )
          return
        }

        // Get frame in window coordinates (screen-relative)
        guard let window = view.window else {
          resolver.reject(
            NSError(
              domain: "SharedTransition",
              code: 500,
              userInfo: [NSLocalizedDescriptionKey: "View not in window hierarchy"]
            )
          )
          return
        }

        let frameInWindow = view.convert(view.bounds, to: window)

        let layout = NativeLayout(
          x: Double(view.frame.origin.x),
          y: Double(view.frame.origin.y),
          width: Double(view.frame.width),
          height: Double(view.frame.height),
          pageX: Double(frameInWindow.origin.x),
          pageY: Double(frameInWindow.origin.y)
        )

        resolver.resolve(layout)
      }
    }
  }

  func registerElement(nativeId: String, transitionId: String) throws {
    registeredElements[nativeId] = transitionId
  }

  func unregisterElement(nativeId: String) throws {
    registeredElements.removeValue(forKey: nativeId)
    cachedSnapshots.removeValue(forKey: nativeId)
  }

  func prepareTransition(sourceNativeId: String, targetNativeId: String) throws -> Promise<PreparedTransition> {
    return Promise { resolver in
      // Capture source
      do {
        let sourceSnapshotPromise = try self.captureSnapshot(nativeId: sourceNativeId)
        let sourceLayoutPromise = try self.measureLayout(nativeId: sourceNativeId)
        let targetSnapshotPromise = try self.captureSnapshot(nativeId: targetNativeId)
        let targetLayoutPromise = try self.measureLayout(nativeId: targetNativeId)

        // Wait for all promises
        sourceSnapshotPromise.then { sourceSnapshot in
          sourceLayoutPromise.then { sourceLayout in
            targetSnapshotPromise.then { targetSnapshot in
              targetLayoutPromise.then { targetLayout in
                let result = PreparedTransition(
                  source: TransitionElement(snapshot: sourceSnapshot, layout: sourceLayout),
                  target: TransitionElement(snapshot: targetSnapshot, layout: targetLayout)
                )
                resolver.resolve(result)
              }
            }
          }
        }
      } catch {
        resolver.reject(error)
      }
    }
  }

  func cleanup() throws {
    // Remove cached snapshot files
    for (_, uri) in cachedSnapshots {
      if let url = URL(string: uri) {
        try? FileManager.default.removeItem(at: url)
      }
    }
    cachedSnapshots.removeAll()
  }

  // MARK: - Private Helpers

  /// Find a view by its nativeID prop (Fabric-safe)
  private func findViewByNativeID(_ nativeId: String) -> UIView? {
    // Search from key window
    guard let window = UIApplication.shared.connectedScenes
      .compactMap({ $0 as? UIWindowScene })
      .flatMap({ $0.windows })
      .first(where: { $0.isKeyWindow }) else {
      return nil
    }

    return findView(withNativeID: nativeId, in: window)
  }

  /// Recursive view search by accessibilityIdentifier (which maps to nativeID in RN)
  private func findView(withNativeID nativeId: String, in view: UIView) -> UIView? {
    // Check if this view has the nativeID
    if view.accessibilityIdentifier == nativeId {
      return view
    }

    // Check React Native's nativeID property directly
    if view.responds(to: Selector(("nativeID"))) {
      if let viewNativeID = view.value(forKey: "nativeID") as? String,
         viewNativeID == nativeId {
        return view
      }
    }

    // Search subviews
    for subview in view.subviews {
      if let found = findView(withNativeID: nativeId, in: subview) {
        return found
      }
    }

    return nil
  }
}
