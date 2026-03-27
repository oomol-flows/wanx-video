# Wanx Video Generator

Generate videos using Alibaba Wanx AI models with 4 modes: text-to-video, image-to-video, keyframe-to-video, and reference-to-video.

## Features

### Text to Video
Generate video from text description using Wanx AI. Supports multiple resolutions (720P to 1080P), durations (2-15 seconds), and shot types (single/multi-shot).

### Image to Video
Generate video from a first frame image. Choose between flash model for speed or standard model for quality. Supports custom audio and multiple resolutions.

### Keyframe to Video
Generate transition video from first and last frame images. Perfect for creating smooth transitions between two images with optional effect templates.

### Reference to Video
Generate video from reference materials (images or videos). Use character placeholders (character1, character2) in prompts to reference uploaded materials.

## Blocks

| Block | Description |
|-------|-------------|
| `text2video` | Generate video from text prompt |
| `image2video` | Generate video from first frame image |
| `keyframe2video` | Generate transition video from first and last frames |
| `reference2video` | Generate video from reference materials |

## License

MIT