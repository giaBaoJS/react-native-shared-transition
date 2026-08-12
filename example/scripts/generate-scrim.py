#!/usr/bin/env python3
"""Regenerate src/assets/scrim.png — the gradient used by <Scrim>.

An 8x512 RGBA PNG of pure black whose alpha ramps 0 -> 1 along an ease-in
curve. It is stretched to fit and tinted at runtime, so one tiny asset serves
every scrim in the app, in both colour schemes.

Usage:  python3 scripts/generate-scrim.py
"""

import os
import struct
import zlib

WIDTH = 8
HEIGHT = 512
# Exponent of the alpha ramp. >1 keeps the transparent end longer, so the top
# of a photograph stays clean and the wash builds only behind the type.
EXPONENT = 1.9

OUT = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "src", "assets", "scrim.png"
)


def chunk(tag: bytes, data: bytes) -> bytes:
    body = tag + data
    return (
        struct.pack(">I", len(data))
        + body
        + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)
    )


def main() -> None:
    raw = b""
    for y in range(HEIGHT):
        raw += b"\x00"  # PNG filter type 0 for this scanline
        t = y / (HEIGHT - 1)
        alpha = int(round(255 * (t**EXPONENT)))
        raw += bytes((0, 0, 0, alpha)) * WIDTH

    png = (
        b"\x89PNG\r\n\x1a\n"
        # 8-bit, colour type 6 (RGBA)
        + chunk(b"IHDR", struct.pack(">IIBBBBB", WIDTH, HEIGHT, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )

    with open(OUT, "wb") as handle:
        handle.write(png)
    print(f"wrote {os.path.normpath(OUT)} ({len(png)} bytes)")


if __name__ == "__main__":
    main()
