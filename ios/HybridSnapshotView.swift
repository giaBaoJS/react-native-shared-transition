import UIKit
import NitroModules

/**
 * Native view for rendering captured snapshots during transitions
 *
 * Displays snapshot images captured from SharedElements during
 * the transition animation. The actual animation is controlled
 * by Reanimated through transform styles on this view's container.
 */
class HybridSnapshotView: HybridSnapshotViewSpec {

  // MARK: - HybridView Required

  var view: UIView {
    return containerView
  }

  // MARK: - UI Components

  private let containerView = UIView()
  private let imageView = UIImageView()

  // MARK: - Props

  var snapshotUri: String = "" {
    didSet {
      loadSnapshot()
    }
  }

  var snapshotWidth: Double = 0 {
    didSet {
      updateLayout()
    }
  }

  var snapshotHeight: Double = 0 {
    didSet {
      updateLayout()
    }
  }

  var resizeMode: ResizeMode = .cover {
    didSet {
      updateContentMode()
    }
  }

  // MARK: - Initialization

  override init() {
    super.init()
    setupViews()
  }

  private func setupViews() {
    containerView.clipsToBounds = true
    imageView.clipsToBounds = true
    imageView.contentMode = .scaleAspectFill

    containerView.addSubview(imageView)
  }

  // MARK: - Methods

  func fadeOut(duration: Double) throws -> Promise<Void> {
    return Promise { resolver in
      DispatchQueue.main.async {
        UIView.animate(
          withDuration: duration / 1000.0,
          animations: {
            self.containerView.alpha = 0
          },
          completion: { _ in
            resolver.resolve(())
          }
        )
      }
    }
  }

  // MARK: - Private

  private func loadSnapshot() {
    guard !snapshotUri.isEmpty else {
      imageView.image = nil
      return
    }

    DispatchQueue.global(qos: .userInitiated).async {
      var image: UIImage?

      if self.snapshotUri.hasPrefix("file://") {
        let path = String(self.snapshotUri.dropFirst(7))
        image = UIImage(contentsOfFile: path)
      } else if self.snapshotUri.hasPrefix("data:") {
        // Handle base64 data URI
        if let dataRange = self.snapshotUri.range(of: ";base64,"),
           let data = Data(base64Encoded: String(self.snapshotUri[dataRange.upperBound...])) {
          image = UIImage(data: data)
        }
      } else if let url = URL(string: self.snapshotUri),
                let data = try? Data(contentsOf: url) {
        image = UIImage(data: data)
      }

      DispatchQueue.main.async {
        self.imageView.image = image
      }
    }
  }

  private func updateLayout() {
    imageView.frame = CGRect(
      x: 0,
      y: 0,
      width: snapshotWidth,
      height: snapshotHeight
    )
  }

  private func updateContentMode() {
    switch resizeMode {
    case .contain:
      imageView.contentMode = .scaleAspectFit
    case .stretch:
      imageView.contentMode = .scaleToFill
    case .cover:
      imageView.contentMode = .scaleAspectFill
    }
  }
}
