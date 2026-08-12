import UIKit
import Foundation
import NitroModules

/**
 * Native module for shared element transitions on iOS.
 *
 * All UIKit work is dispatched to the main actor — Nitro promises resolve on a
 * background executor, so every view lookup / render happens inside
 * `MainActor.run`.
 *
 * Views are found by the `nativeID` prop: Fabric stores it on
 * `RCTViewComponentView.nativeId`, which we read via KVC so this module does
 * not need to link against React internals. `accessibilityIdentifier`
 * (populated by `testID`) is used as a fallback strategy.
 */
class HybridSharedTransitionModule: HybridSharedTransitionModuleSpec {

  // MARK: - State (main-thread only)

  /// Files written by captureSnapshot, removed on cleanup()
  private var snapshotFiles: [URL] = []

  /// nativeIDs currently hidden through setNodeHidden
  private var hiddenNodes: Set<String> = []

  // MARK: - Spec implementation

  func measureNode(nativeId: String) throws -> Promise<MeasuredFrame> {
    return Promise.async {
      try await MainActor.run {
        guard let view = Self.findView(nativeId: nativeId) else {
          throw RuntimeError.error(withMessage: "View not found for nativeID \"\(nativeId)\"")
        }
        guard let window = view.window else {
          throw RuntimeError.error(withMessage: "View \"\(nativeId)\" is not attached to a window")
        }
        let frame = view.convert(view.bounds, to: window)
        return MeasuredFrame(
          x: Double(frame.origin.x),
          y: Double(frame.origin.y),
          width: Double(frame.width),
          height: Double(frame.height)
        )
      }
    }
  }

  func captureSnapshot(nativeId: String) throws -> Promise<SnapshotResult> {
    return Promise.async {
      let (data, width, height) = try await MainActor.run {
        () -> (Data, Double, Double) in
        guard let view = Self.findView(nativeId: nativeId) else {
          throw RuntimeError.error(withMessage: "View not found for nativeID \"\(nativeId)\"")
        }
        guard view.bounds.width > 0, view.bounds.height > 0 else {
          throw RuntimeError.error(withMessage: "View \"\(nativeId)\" has zero size")
        }
        let renderer = UIGraphicsImageRenderer(bounds: view.bounds)
        let image = renderer.image { context in
          view.layer.render(in: context.cgContext)
        }
        guard let png = image.pngData() else {
          throw RuntimeError.error(withMessage: "Failed to encode snapshot for \"\(nativeId)\"")
        }
        return (png, Double(view.bounds.width), Double(view.bounds.height))
      }

      // File I/O off the main thread
      let safeId = nativeId.replacingOccurrences(of: "/", with: "_")
      let fileName = "shared_transition_\(safeId)_\(UInt64(Date().timeIntervalSince1970 * 1000)).png"
      let fileURL = FileManager.default.temporaryDirectory.appendingPathComponent(fileName)
      try data.write(to: fileURL)

      await MainActor.run {
        self.snapshotFiles.append(fileURL)
      }

      return SnapshotResult(uri: fileURL.absoluteString, width: width, height: height)
    }
  }

  func setNodeHidden(nativeId: String, hidden: Bool) throws {
    DispatchQueue.main.async {
      if hidden {
        self.hiddenNodes.insert(nativeId)
      } else {
        self.hiddenNodes.remove(nativeId)
      }
      guard let view = Self.findView(nativeId: nativeId) else {
        return // View may already be unmounted — ignore.
      }
      // Use alpha instead of isHidden: isHidden can be overridden by
      // Fabric prop updates mid-transition, and alpha changes don't
      // trigger layout.
      view.alpha = hidden ? 0.0 : 1.0
    }
  }

  func cleanup() throws {
    DispatchQueue.main.async {
      for nativeId in self.hiddenNodes {
        Self.findView(nativeId: nativeId)?.alpha = 1.0
      }
      self.hiddenNodes.removeAll()

      let files = self.snapshotFiles
      self.snapshotFiles.removeAll()
      DispatchQueue.global(qos: .utility).async {
        for url in files {
          try? FileManager.default.removeItem(at: url)
        }
      }
    }
  }

  // MARK: - View lookup

  @MainActor
  private static func findView(nativeId: String) -> UIView? {
    for window in allWindows() {
      if let found = findView(nativeId: nativeId, in: window) {
        return found
      }
    }
    return nil
  }

  @MainActor
  private static func allWindows() -> [UIWindow] {
    let scenes = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .filter { $0.activationState == .foregroundActive || $0.activationState == .foregroundInactive }
    let windows = scenes.flatMap { $0.windows }
    // Key window first so the common case terminates quickly.
    return windows.sorted { $0.isKeyWindow && !$1.isKeyWindow }
  }

  @MainActor
  private static func findView(nativeId: String, in view: UIView) -> UIView? {
    // Strategy 1: Fabric's RCTViewComponentView exposes `nativeId`.
    if view.responds(to: NSSelectorFromString("nativeId")),
       let value = view.value(forKey: "nativeId") as? String,
       value == nativeId {
      return view
    }
    // Strategy 2: testID → accessibilityIdentifier fallback.
    if view.accessibilityIdentifier == nativeId {
      return view
    }
    for subview in view.subviews {
      if let found = findView(nativeId: nativeId, in: subview) {
        return found
      }
    }
    return nil
  }
}
