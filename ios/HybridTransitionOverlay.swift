import UIKit
import NitroModules

/**
 * Native view for rendering transition overlays
 *
 * Displays snapshot images during shared element transitions.
 * Position/scale animations are controlled via Reanimated transforms.
 *
 * Features:
 * - Efficient image loading from file/data URIs
 * - Native fade animations
 * - Multiple resize modes
 */
class HybridTransitionOverlay: HybridTransitionOverlaySpec {

    // MARK: - HybridView Required

    public var view: UIView {
        return containerView
    }

    // MARK: - UI Components

    private let containerView = UIView()
    private let imageView = UIImageView()

    // MARK: - Props

    public var snapshotUri: String = "" {
        didSet {
            loadSnapshot()
        }
    }

    public var snapshotWidth: Double = 0 {
        didSet {
            updateLayout()
        }
    }

    public var snapshotHeight: Double = 0 {
        didSet {
            updateLayout()
        }
    }

    public var resizeMode: OverlayResizeMode = .stretch {
        didSet {
            updateContentMode()
        }
    }

    public var opacity: Double = 1.0 {
        didSet {
            containerView.alpha = CGFloat(opacity)
        }
    }

    // MARK: - Initialization

    override init() {
        super.init()
        setupViews()
    }

    private func setupViews() {
        containerView.clipsToBounds = true
        containerView.backgroundColor = .clear

        imageView.clipsToBounds = true
        imageView.contentMode = .scaleToFill
        imageView.backgroundColor = .clear

        containerView.addSubview(imageView)
    }

    // MARK: - Methods

    func fadeOut(duration: Double) throws -> Promise<Void> {
        return Promise.async {
            await withCheckedContinuation { continuation in
                DispatchQueue.main.async {
                    UIView.animate(
                        withDuration: duration / 1000.0,
                        delay: 0,
                        options: [.curveEaseOut],
                        animations: {
                            self.containerView.alpha = 0
                        },
                        completion: { _ in
                            continuation.resume()
                        }
                    )
                }
            }
        }
    }

    func updateSnapshot(uri: String) throws {
        self.snapshotUri = uri
    }

    // MARK: - Private

    private func loadSnapshot() {
        guard !snapshotUri.isEmpty else {
            imageView.image = nil
            return
        }

        // Load on background thread for performance
        DispatchQueue.global(qos: .userInteractive).async { [weak self] in
            guard let self = self else { return }

            var image: UIImage?

            if self.snapshotUri.hasPrefix("file://") {
                // File URI
                let path = String(self.snapshotUri.dropFirst(7))
                image = UIImage(contentsOfFile: path)
            } else if self.snapshotUri.hasPrefix("data:") {
                // Base64 data URI
                if let dataRange = self.snapshotUri.range(of: ";base64,"),
                   let data = Data(base64Encoded: String(self.snapshotUri[dataRange.upperBound...])) {
                    image = UIImage(data: data)
                }
            } else if let url = URL(string: self.snapshotUri),
                      let data = try? Data(contentsOf: url) {
                // Regular URL
                image = UIImage(data: data)
            }

            DispatchQueue.main.async {
                self.imageView.image = image
            }
        }
    }

    private func updateLayout() {
        // Fill container
        imageView.frame = containerView.bounds

        // If we have explicit dimensions, use those
        if snapshotWidth > 0 && snapshotHeight > 0 {
            containerView.bounds = CGRect(
                x: 0,
                y: 0,
                width: snapshotWidth,
                height: snapshotHeight
            )
            imageView.frame = containerView.bounds
        }
    }

    private func updateContentMode() {
        switch resizeMode {
        case .contain:
            imageView.contentMode = .scaleAspectFit
        case .cover:
            imageView.contentMode = .scaleAspectFill
        case .stretch:
            imageView.contentMode = .scaleToFill
        }
    }
}
