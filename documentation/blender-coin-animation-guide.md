# Blender Animated Coin Tutorial: Embodied Mind Logo

A complete guide for creating a 3D animated coin with the embodied mind logo that rolls, flips, and loops seamlessly.

**Duration:** ~6 seconds (easily adjustable)  
**Output formats:** MP4, WebP, GIF  
**Skill level:** Beginner-friendly

---

## Table of Contents

1. [Setup and Preparation](#1-setup-and-preparation)
2. [Creating the Coin Geometry](#2-creating-the-coin-geometry)
3. [Preparing the Logo Materials](#3-preparing-the-logo-materials)
4. [Setting Up Lighting](#4-setting-up-lighting)
5. [Camera Setup](#5-camera-setup)
6. [Animation Sequence](#6-animation-sequence)
7. [Rendering](#7-rendering)
8. [Format Conversion](#8-format-conversion)
9. [Speed Adjustment](#9-speed-adjustment)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Setup and Preparation

### 1.1 Open Blender and Basic Setup

1. Launch Blender
2. Delete the default cube:
   - Select cube (left-click)
   - Press `X` → Delete
3. Delete the default light (we'll add better lighting later):
   - Select lamp (left-click)
   - Press `X` → Delete
4. Keep the camera (we'll position it later)

### 1.2 Set Project Units

1. Open Scene Properties (icon: cone with spheres)
2. Under "Units":
   - Set Length: `Millimeters`
   - This makes coin dimensions realistic (typical coin: 25mm diameter, 2mm thick)

### 1.3 Set Timeline for Animation

1. Look at the bottom Timeline panel
2. Set End Frame to `144` (6 seconds at 24 FPS)
   - This gives you 6-second duration
   - To adjust speed later, just change FPS or frame range

---

## 2. Creating the Coin Geometry

### 2.1 Add Cylinder for Coin Base

1. Press `Shift + A` → Mesh → Cylinder
2. In the bottom-left "Add Cylinder" panel, set:
   - Vertices: `64` (makes smooth circular edge)
   - Radius: `12.5` (mm - typical coin size)
   - Depth: `2` (mm - coin thickness)
   - Cap Fill Type: `Triangle Fan`

### 2.2 Position the Coin

1. With cylinder selected, press `N` to open properties panel
2. Under "Transform" → Location:
   - X: `0`
   - Y: `0`
   - Z: `1` (lifts coin 1mm above ground)

### 2.3 Smooth the Coin Surface

1. With coin selected, right-click → Shade Smooth
2. This makes the rendering look more realistic

---

## 3. Preparing the Logo Materials

### 3.1 Convert SVG Logo to Image

**Option A: Using Inkscape (Recommended)**
1. Open `images/logos/logo-embodied-mind.svg` in Inkscape
2. File → Export → PNG Image
3. Set:
   - Width: `2048` px (high resolution)
   - DPI: `300`
   - Export area: Page
4. Export as `logo-embodied-mind-heads.png` in `images/logos/`

**Option B: Using Command Line (ImageMagick)**
```bash
cd images/logos/
convert -density 300 -background transparent logo-embodied-mind.svg -resize 2048x2048 logo-embodied-mind-heads.png
```

### 3.2 Create Mirrored Version for Tails

**Using ImageMagick:**
```bash
convert logo-embodied-mind-heads.png -flop logo-embodied-mind-tails.png
```

**Or using GIMP:**
1. Open `logo-embodied-mind-heads.png`
2. Image → Transform → Flip Horizontally
3. Export as `logo-embodied-mind-tails.png`

### 3.3 Apply Materials to Coin

#### Set up Shading Workspace
1. At the top, click "Shading" tab
2. This gives you shader editor at bottom

#### Create Heads Material (Top Face)
1. Select the coin
2. Switch to Edit Mode: Press `Tab`
3. Press `Alt + A` to deselect all
4. Press `3` for face select mode
5. Select the top face of the cylinder (click it)
6. In Properties panel (right side), click Material Properties (sphere icon)
7. Click `+ New` to add material
8. Name it "Heads"
9. In Shader Editor (bottom):
   - Click `Add` → Texture → Image Texture
   - Click folder icon → Navigate to `logo-embodied-mind-heads.png`
   - Connect yellow "Color" output to "Base Color" input of Principled BSDF
   - Set Principled BSDF properties:
     - Metallic: `0.7`
     - Roughness: `0.3`
     - Specular: `0.5`

#### Create Tails Material (Bottom Face)
1. Still in Edit Mode
2. Press `Alt + A` to deselect all
3. Select the bottom face (rotate view: Middle mouse drag, or `Numpad 7` then `Ctrl + Numpad 7`)
4. Click `+` to add new material slot
5. Click `+ New` material
6. Name it "Tails"
7. Click `Assign` to assign to bottom face
8. Repeat texture setup with `logo-embodied-mind-tails.png`

#### Create Edge Material (Side Face)
1. Still in Edit Mode
2. Press `Alt + A` to deselect all
3. Select the side face (click the cylindrical edge)
4. Click `+` to add new material slot
5. Click `+ New` material
6. Name it "Edge"
7. Click `Assign`
8. In Shader Editor:
   - Set Principled BSDF:
     - Base Color: Gold/silver color (R: 0.9, G: 0.8, B: 0.5)
     - Metallic: `0.9`
     - Roughness: `0.2`

9. Press `Tab` to exit Edit Mode

### 3.4 UV Mapping for Logo Textures

#### UV Map Top Face (Heads)
1. Select coin
2. Press `Tab` for Edit Mode
3. Press `Alt + A` to deselect all
4. Switch to Face select mode: Press `3`
5. Select top face
6. Press `U` → Project from View
7. At top, click "UV Editing" tab
8. Scale UV to fit: Press `S` → `0.9` → Enter
9. Center UV: Press `G` to move, center it in UV space

#### UV Map Bottom Face (Tails)
1. In Edit Mode, deselect all (`Alt + A`)
2. Select bottom face
3. Press `U` → Project from View
4. Scale and center like heads

---

## 4. Setting Up Lighting

### 4.1 Add Three-Point Lighting

#### Key Light (Main Light)
1. Press `Shift + A` → Light → Area
2. Press `G` → `Z` → `50` → Enter (move up 50mm)
3. Press `G` → `X` → `30` → Enter (move right)
4. Press `G` → `Y` → `-30` → Enter (move forward)
5. Rotate to point at coin:
   - Press `R` → `X` → `45` → Enter
6. In Light Properties (right panel):
   - Power: `50` W
   - Size: `5`

#### Fill Light
1. Press `Shift + A` → Light → Area
2. Move to opposite side:
   - `G` → `X` → `-30` → Enter
   - `G` → `Y` → `-20` → Enter
   - `G` → `Z` → `30` → Enter
3. Light Properties:
   - Power: `20` W
   - Size: `5`

#### Rim Light
1. Press `Shift + A` → Light → Area
2. Position behind coin:
   - `G` → `Y` → `30` → Enter
   - `G` → `Z` → `30` → Enter
3. Light Properties:
   - Power: `30` W
   - Size: `5`

---

## 5. Camera Setup

### 5.1 Position Starting Camera

1. Select camera
2. Press `N` to open Transform panel
3. Set Location:
   - X: `0`
   - Y: `-50` (50mm away from coin)
   - Z: `1` (at coin height)
4. Set Rotation:
   - X: `90°`
   - Y: `0°`
   - Z: `0°`

### 5.2 Camera Settings

1. With camera selected, open Camera Properties (camera icon)
2. Set:
   - Lens Type: `Perspective`
   - Focal Length: `50` mm
   - Sensor Fit: `Horizontal`

### 5.3 Test Camera View

1. Press `Numpad 0` to look through camera
2. Coin should be centered and facing camera

---

## 6. Animation Sequence

We'll create animation in phases. Frame breakdown:
- Frames 1-36: Camera reveal (1.5 sec)
- Frames 37-84: Coin rolls on edge (2 sec)
- Frames 85-108: Coin falls over (1 sec)
- Frames 109-144: Camera moves above (1.5 sec)

### 6.1 Set Up Scene for Animation

1. At top of screen, click "Layout" tab
2. Make sure Timeline is visible at bottom
3. Current frame indicator is the blue line

### 6.2 Phase 1: Camera Reveal (Frames 1-36)

#### Keyframe 1 (Frame 1)
1. Select Camera
2. In Timeline, go to frame `1`
3. Set camera position/rotation:
   - Location Y: `-50`
   - Location Z: `1`
   - Rotation X: `90°`
4. Press `I` → Location & Rotation (adds keyframe)

#### Keyframe 2 (Frame 36)
1. Move to frame `36` in Timeline
2. Adjust camera to show 3D depth:
   - Press `G` → `X` → `5` → Enter (move right slightly)
   - Press `G` → `Z` → `3` → Enter (move up slightly)
   - Press `R` → `Z` → `5` → Enter (rotate slightly)
3. Press `I` → Location & Rotation

### 6.3 Phase 2: Coin Rolls on Edge (Frames 37-108)

#### Keyframe 3 (Frame 37)
1. Select Coin
2. Go to frame `37`
3. Set starting position for roll:
   - Location X: `0`
   - Location Z: `1`
   - Rotation Y: `0°`
4. Press `I` → Location & Rotation

#### Keyframe 4 (Frame 84)
1. Go to frame `84`
2. Coin should roll 360° (one full rotation):
   - Location X: `25` (coin diameter × π ≈ 25mm)
   - Location Z: `12.5` (coin stands on edge, raised by radius)
   - Rotation Y: `360°` (type 360 in Rotation Y field)
3. Press `I` → Location & Rotation

#### Fix Rotation to Continuous Roll
1. Select coin
2. Open Graph Editor (change top-right editor type to Graph Editor)
3. Select Y Rotation channel in left sidebar
4. Select all keyframes: `A`
5. Set interpolation: `T` → Linear
6. In properties panel (`N`), under Active Keyframe:
   - Check "Extrapolation": Extrapolate (makes continuous rotation)

### 6.4 Phase 3: Coin Falls Over (Frames 85-108)

#### Keyframe 5 (Frame 108)
1. Select Coin
2. Go to frame `108`
3. Coin falls flat:
   - Location X: `25`
   - Location Z: `1` (back to lying flat)
   - Rotation Y: `360°`
   - Rotation X: `90°` (falls to side)
4. Press `I` → Location & Rotation

### 6.5 Phase 4: Camera Moves Above (Frames 109-144)

#### Keyframe 6 (Frame 109)
1. Select Camera
2. Go to frame `109`
3. Press `I` → Location & Rotation (marks current position)

#### Keyframe 7 (Frame 144)
1. Go to frame `144`
2. Move camera directly above coin:
   - Location X: `25` (above fallen coin)
   - Location Y: `0`
   - Location Z: `50` (50mm above coin)
   - Rotation X: `0°` (pointing straight down)
   - Rotation Y: `0°`
   - Rotation Z: `0°`
3. Press `I` → Location & Rotation

### 6.6 Make Animation Loop Seamlessly

To make the loop work, we need the coin to return to original position:

#### Add Loop Reset (Frame 145 - Not Rendered)
1. Select Coin
2. Go to frame `145`
3. Reset coin position:
   - Location X: `0`
   - Location Z: `1`
   - Rotation X: `0°`
   - Rotation Y: `0°`
4. Press `I` → Location & Rotation

**Note:** We won't render frame 145, but it helps the loop transition smoothly.

### 6.7 Test Animation

1. Go to frame `1`: Press `Shift + Left Arrow` repeatedly, or type `1` in frame field
2. Press `Spacebar` to play animation
3. Watch in viewport

---

## 7. Rendering

### 7.1 Render Settings

1. Open Render Properties (camera icon in right panel)
2. Set Render Engine: `Cycles` (better quality) or `Eevee` (faster)
3. Under Sampling:
   - Render: `128` samples (Cycles) or `64` (Eevee)
4. Under Output Properties:
   - Resolution X: `1920`
   - Resolution Y: `1080`
   - Frame Rate: `24` fps
   - Frame Start: `1`
   - Frame End: `144`
   - Output: Click folder icon → Choose save location
   - File Format: `FFmpeg video`
   - Encoding:
     - Container: `MPEG-4`
     - Video Codec: `H.264`
     - Output Quality: `High`

### 7.2 Background and Rendering

#### Set Background
1. At top, click "Shading" tab
2. Click "World" button at top of Shader Editor
3. Background color:
   - Click color swatch next to Background shader
   - Set to white or desired background color

#### Enable Transparent Background (Optional)
1. In Render Properties → Film
2. Check "Transparent"
3. Under Output Properties → Encoding:
   - Video Codec: `PNG` or `AV1` (supports transparency)

### 7.3 Render Animation

1. Click Render → Render Animation (or press `Ctrl + F12`)
2. Wait for render to complete (6 seconds at 24fps = 144 frames)
3. Video saves to location you specified
4. Find the output file (e.g., `coin-animation.mp4`)

---

## 8. Format Conversion

### 8.1 Convert MP4 to Animated WebP

Using FFmpeg in terminal:

```bash
# Navigate to your output directory
cd /path/to/output/

# Convert to WebP (high quality)
ffmpeg -i coin-animation.mp4 \
  -vcodec libwebp \
  -lossless 0 \
  -compression_level 6 \
  -q:v 80 \
  -loop 0 \
  -preset default \
  -an -vsync 0 \
  coin-animation.webp
```

**Quality Options:**
- `-q:v 80`: Quality (0-100, higher = better, larger file)
- `-compression_level 6`: CPU time vs size (0-6, higher = smaller but slower)
- `-loop 0`: Infinite loop

### 8.2 Convert MP4 to Animated GIF

```bash
# Two-pass for best quality GIF

# Pass 1: Generate palette
ffmpeg -i coin-animation.mp4 \
  -vf "fps=24,scale=800:-1:flags=lanczos,palettegen=stats_mode=diff" \
  -y palette.png

# Pass 2: Create GIF using palette
ffmpeg -i coin-animation.mp4 -i palette.png \
  -lavfi "fps=24,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5" \
  -loop 0 \
  coin-animation.gif

# Clean up
rm palette.png
```

**Size/Quality Options:**
- `fps=24`: Frame rate (lower = smaller file, less smooth)
- `scale=800:-1`: Width in pixels (lower = smaller file)
- `bayer_scale=5`: Dithering (0-5, higher = more dithering)

### 8.3 Optimized GIF for Web

For smaller file size:

```bash
# Reduced quality for web
ffmpeg -i coin-animation.mp4 \
  -vf "fps=12,scale=400:-1:flags=lanczos,palettegen=stats_mode=diff" \
  -y palette-web.png

ffmpeg -i coin-animation.mp4 -i palette-web.png \
  -lavfi "fps=12,scale=400:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" \
  -loop 0 \
  coin-animation-web.gif

rm palette-web.png
```

---

## 9. Speed Adjustment

### 9.1 Change Animation Speed in Blender

#### Method 1: Adjust FPS (Easiest)
1. Open Output Properties
2. Change Frame Rate:
   - `12` fps = Half speed (slower)
   - `24` fps = Normal speed
   - `48` fps = Double speed (faster)

#### Method 2: Adjust Frame Range
1. In Timeline, change End Frame:
   - `72` frames = 3 seconds (faster)
   - `144` frames = 6 seconds (normal)
   - `288` frames = 12 seconds (slower)
2. Select all keyframes in Graph Editor
3. Scale time: `S` → `X` → `0.5` (faster) or `2` (slower)

### 9.2 Speed Up After Rendering

```bash
# Double speed (2x faster)
ffmpeg -i coin-animation.mp4 \
  -filter:v "setpts=0.5*PTS" \
  coin-animation-fast.mp4

# Half speed (2x slower)
ffmpeg -i coin-animation.mp4 \
  -filter:v "setpts=2.0*PTS" \
  coin-animation-slow.mp4
```

---

## 10. Troubleshooting

### Issue: Logo Appears Blurry

**Solution:**
1. Use higher resolution PNG (4096×4096)
2. In Image Texture node, set Interpolation: `Smart`
3. Increase render samples

### Issue: Logo Not Visible on Coin

**Solution:**
1. Check UV mapping in UV Editing tab
2. Ensure Image Texture is connected to Base Color
3. In Edit Mode, verify material is assigned to correct face
4. Press `Z` → Material Preview to see materials in viewport

### Issue: Animation Jumps/Not Smooth

**Solution:**
1. Open Graph Editor
2. Select all keyframes: `A`
3. Set interpolation: `T` → Bezier (smooth) or Linear
4. Check Handle Type: `V` → Automatic

### Issue: Coin Rotation Wrong Direction

**Solution:**
1. Select coin in frame `84`
2. In Rotation Y, try:
   - `360` for one direction
   - `-360` for opposite direction

### Issue: Camera Not Following Path Smoothly

**Solution:**
1. Select camera keyframes in Graph Editor
2. Set interpolation to Bezier: `T` → Bezier
3. Adjust handles for smooth curve

### Issue: Render Takes Too Long

**Solutions:**
- Use Eevee engine instead of Cycles
- Lower samples: 64 or 32
- Reduce resolution: 1280×720
- Disable ambient occlusion and bloom

### Issue: File Size Too Large

**Solutions for MP4:**
```bash
# Compress video
ffmpeg -i coin-animation.mp4 \
  -vcodec libx264 \
  -crf 23 \
  -preset medium \
  coin-animation-compressed.mp4
```
- Higher CRF = smaller file (range: 18-28)

**Solutions for GIF:**
- Reduce fps: `fps=12` instead of `fps=24`
- Reduce size: `scale=400:-1` instead of `scale=800:-1`
- Use WebP instead (much smaller)

### Issue: Animation Not Looping

**Solution:**
1. Make sure frame 1 and frame 144 have similar camera angles
2. Coin should return to same position/rotation
3. In video player, enable loop mode
4. For web embedding:
   ```html
   <video loop autoplay muted playsinline>
     <source src="coin-animation.mp4" type="video/mp4">
   </video>
   ```

---

## Quick Reference Commands

### Essential Blender Shortcuts

- `Tab`: Toggle Edit Mode
- `Numpad 0`: Camera view
- `Spacebar`: Play animation
- `I`: Insert keyframe
- `G`: Grab/move
- `R`: Rotate
- `S`: Scale
- `X/Y/Z` after G/R/S: Constrain to axis
- `Shift + A`: Add object
- `Ctrl + S`: Save
- `Ctrl + F12`: Render animation
- `Alt + A`: Deselect all

### File Locations

```
project/
├── images/logos/
│   ├── logo-embodied-mind.svg (original)
│   ├── logo-embodied-mind.svg.backup (original backup)
│   ├── logo-embodied-mind-heads.png (export this)
│   └── logo-embodied-mind-tails.png (create mirrored)
├── output/ (create this folder)
│   ├── coin-animation.mp4
│   ├── coin-animation.webp
│   └── coin-animation.gif
└── coin-animation.blend (save your Blender file here)
```

---

## Advanced Tips

### Add Motion Blur

1. Render Properties → Sampling
2. Enable Motion Blur
3. Set Shutter: `0.5` (amount of blur)

### Add Depth of Field

1. Select camera
2. Camera Properties → Depth of Field
3. Check "Depth of Field"
4. Set Focus Object: Select coin
5. F-Stop: `2.8` (lower = more blur)

### Add Background Floor

1. `Shift + A` → Mesh → Plane
2. Scale: `S` → `100` → Enter
3. Move down: `G` → `Z` → `-1` → Enter
4. Add material with different color
5. Reduces floating appearance

### Export Frames as Image Sequence

1. Output Properties
2. File Format: `PNG`
3. Color: `RGBA` (if want transparency)
4. Render Animation
5. Creates numbered PNGs: `0001.png`, `0002.png`, etc.
6. Useful for custom editing or frame-by-frame adjustments

---

## Conclusion

You now have a complete animated coin with:
- ✅ Embodied mind logo on heads
- ✅ Mirrored logo on tails
- ✅ 3D reveal animation
- ✅ Rolling motion
- ✅ Overhead view finish
- ✅ Loopable sequence
- ✅ Multiple output formats

**Next Steps:**
1. Save your project: `Ctrl + S`
2. Experiment with colors, lighting, camera angles
3. Try different background colors
4. Adjust animation timing to your preference

**Need Help?**
- Blender manual: https://docs.blender.org/
- r/blender subreddit
- Blender Stack Exchange
- YouTube: Search "Blender coin animation tutorial"

Good luck with your animation! 🎬
