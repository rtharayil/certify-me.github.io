"""Make claim-safe homepage hero variants from the original illustrative artwork.

This retains the source illustration and its composition, changing only copy
that would otherwise imply verified data or live integrations. The original
file in attached_assets is intentionally left untouched.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


SOURCE = Path(
    "attached_assets/ChatGPT_Image_Sep_29,_2026,_10_15_20_PM_1790779910080.png"
)
OUTPUT = Path("assets4/images")
REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(BOLD if bold else REGULAR, size)


def cover(
    image: Image.Image,
    box: tuple[int, int, int, int],
    color: tuple[int, int, int, int],
) -> None:
    # All replacements are inside opaque, near-white card interiors.
    ImageDraw.Draw(image).rectangle(box, fill=color)


def main() -> None:
    artwork = Image.open(SOURCE).convert("RGBA")
    if artwork.size != (1106, 1422):
        raise ValueError(f"Unexpected artwork size: {artwork.size}")
    draw = ImageDraw.Draw(artwork)

    # Credential card: the verification standard is a capability; this sample
    # is not evidence that its imaginary issuer is globally recognised.
    cover(artwork, (88, 547, 216, 626), (253, 253, 253, 254))
    draw.multiline_text(
        (92, 553), "Illustrative\nexample",
        font=font(19), fill="#586079", spacing=5,
    )

    # Taxonomy logos remain as examples of taxonomies, not asserted crosswalks.
    cover(artwork, (693, 326, 983, 363), (254, 254, 254, 254))
    draw.text((700, 329), "Taxonomy examples", font=font(19, True), fill="#17214c")

    # The decorative QR code is not an active verification link.
    cover(artwork, (80, 913, 204, 973), (252, 252, 252, 254))
    draw.multiline_text(
        (142, 919), "Sample\nQR code",
        font=font(20, True), anchor="ma", align="center",
        fill="#17214c", spacing=2,
    )

    # The fictional record and its skills have not been issued or verified.
    cover(artwork, (868, 690, 1046, 725), (249, 251, 255, 254))
    draw.text((877, 696), "Example learner record", font=font(16), fill="#293b76")
    cover(artwork, (857, 899, 1048, 924), (253, 253, 254, 254))
    draw.text((863, 900), "Example skill links", font=font(16), fill="#636b7c")

    # Identity badge: retain the fictional learner and the original card.
    cover(artwork, (270, 1185, 536, 1227), (252, 252, 253, 254))
    draw.text((273, 1189), "Example credentials", font=font(23, True), fill="#6452c7")

    # Replace the unsupported job count without altering the role examples.
    cover(artwork, (742, 1181, 917, 1263), (252, 252, 253, 254))
    draw.text((748, 1188), "Example roles", font=font(25, True), fill="#4636d2")
    draw.text((749, 1230), "Illustrative view", font=font(18), fill="#606981")

    for width, height in ((960, 1234), (480, 617)):
        result = artwork.resize((width, height), Image.Resampling.LANCZOS)
        result.save(
            OUTPUT / f"certifyme-verifiable-credentials-skills-clr-hero-{width}.webp",
            "WEBP",
            quality=88,
            method=6,
        )


if __name__ == "__main__":
    main()