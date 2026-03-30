# Blender Coin Animation - Quick Reference

Fast reference guide for creating the embodied mind coin animation.

---

## 📋 Prerequisites Checklist

- [ ] Blender installed (3.0 or later)
- [ ] SVG logo cleaned: `images/logos/logo-embodied-mind.svg`
- [ ] FFmpeg installed (for format conversion)
- [ ] ImageMagick or Inkscape (for PNG export)
- [ ] ~2GB disk space for renders

---

## 🚀 Quick Start (30 Minutes)

### 1. Prepare Logo (5 min)

```bash
# Export PNG from SVG (2048x2048 px)
cd images/logos/
convert -density 300 -background transparent \
  logo-embodied-mind.svg -resize 2048x2048 \
  logo-embodied-mind-heads.png

# Create mirrored version for tails
convert logo-embodied-mind-heads.png -flop \
  logo-embodied-mind-tails.png
```

### 2. Blender Setup (10 min)

1. **New project**: Delete cube, delete lamp, keep camera
2. **Add coin**: `Shift+A` → Mesh → Cylinder
   - Vertices: 64
   - Radius: 12.5mm
   - Depth: 2mm
3. **Smooth shading**: Right-click coin → Shade Smooth

### 3. Apply Materials (10 min)

1. **Top face (heads)**:
   - Edit Mode (`Tab`), select top face
   - Add material → Image Texture → `logo-embodied-mind-heads.png`
   - Metallic: 0.7, Roughness: 0.3

2. **Bottom face (tails)**:
   - Select bottom face
   - Add material → Image Texture → `logo-embodied-mind-tails.png`
   - Metallic: 0.7, Roughness: 0.3

3. **Edge (side)**:
   - Select side face
   - Add material → Gold color (R:0.9, G:0.8, B:0.5)
   - Metallic: 0.9, Roughness: 0.2

### 4. Animation (5 min)

**Camera positions** (press `I` after each):

| Frame | Camera Location | Rotation |
|-------|----------------|----------|
| 1     | Y:-50, Z:1     | X:90°    |
| 36    | X:5, Y:-50, Z:3 | X:90°, Z:5° |
| 109   | (same as 36)   | (same)   |
| 144   | X:25, Y:0, Z:50 | X:0°     |

**Coin positions** (press `I` after each):

| Frame | Location | Rotation |
|-------|----------|----------|
| 37    | X:0, Z:1 | Y:0°     |
| 84    | X:25, Z:12.5 | Y:360° |
| 108   | X:25, Z:1 | Y:360°, X:90° |

### 5. Render (Varies)

1. Render Properties → Cycles (or Eevee for faster)
2. Output Properties:
   - Resolution: 1920×1080
   - Frame Rate: 24 fps
   - Format: FFmpeg video (H.264)
3. `Ctrl+F12` to render

---

## 🎬 Post-Production

### Convert Formats

```bash
# All formats at once
./bin/convert-animation-formats.sh coin-animation.mp4

# Output:
# - coin-animation.webp (high quality)
# - coin-animation.gif (high quality, ~800px)
# - coin-animation-web.gif (optimized, ~400px)
```

### Adjust Speed

```bash
# Double speed (3 seconds instead of 6)
./bin/adjust-animation-speed.sh coin-animation.mp4 2.0

# Half speed (12 seconds instead of 6)
./bin/adjust-animation-speed.sh coin-animation.mp4 0.5

# Custom speed
./bin/adjust-animation-speed.sh coin-animation.mp4 1.5 coin-fast.mp4
```

---

## ⌨️ Essential Blender Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Edit Mode toggle |
| `Numpad 0` | Camera view |
| `Spacebar` | Play animation |
| `I` | Insert keyframe |
| `G` | Move (then X/Y/Z for axis) |
| `R` | Rotate (then X/Y/Z for axis) |
| `S` | Scale |
| `Shift+A` | Add object |
| `Z` | View shading menu |
| `Ctrl+S` | Save |
| `Ctrl+F12` | Render animation |

---

## 📐 Key Measurements

- **Coin diameter**: 25mm (2.5cm)
- **Coin thickness**: 2mm
- **Camera distance**: 50mm initially
- **Animation duration**: 144 frames @ 24fps = 6 seconds
- **Full rotation**: 360° over ~48 frames

---

## 🎨 Material Settings Cheat Sheet

### Logo Material (Heads/Tails)
```
Base Color: Image Texture (PNG)
Metallic: 0.7
Roughness: 0.3
Specular: 0.5
```

### Edge Material (Gold)
```
Base Color: RGB(0.9, 0.8, 0.5)
Metallic: 0.9
Roughness: 0.2
Specular: 0.5
```

---

## 🎯 Animation Breakdown

| Phase | Frames | Duration | Action |
|-------|--------|----------|--------|
| Reveal | 1-36 | 1.5s | Camera shows 3D depth |
| Roll | 37-84 | 2.0s | Coin rolls on edge (360°) |
| Fall | 85-108 | 1.0s | Coin falls flat |
| Overhead | 109-144 | 1.5s | Camera moves above |

---

## 🔧 Common Fixes

### Logo not visible?
```
1. Check UV mapping in UV Editing tab
2. Verify Image Texture connected to Base Color
3. Press Z → Material Preview mode
```

### Animation jumpy?
```
1. Graph Editor → Select all keyframes (A)
2. Set interpolation: T → Bezier
```

### Render too slow?
```
1. Use Eevee instead of Cycles
2. Lower samples to 64
3. Reduce resolution to 1280×720
```

### File too large?
```bash
# Compress video
ffmpeg -i coin.mp4 -crf 23 coin-compressed.mp4

# Smaller GIF
./bin/convert-animation-formats.sh coin.mp4
# Use the -web.gif version
```

---

## 📊 Typical File Sizes

| Format | Size | Best For |
|--------|------|----------|
| MP4 (1080p) | 2-5 MB | High quality video |
| WebP | 1-3 MB | Web with transparency |
| GIF (800px) | 5-15 MB | High quality web |
| GIF (400px) | 1-3 MB | Email, thumbnails |

---

## 🔄 Making Perfect Loops

1. **Frame 1 = Frame 144**: Same camera angle
2. **Coin rotation**: Use multiples of 360°
3. **Test loop**: Play frames 1-144 repeatedly
4. **Web embedding**:
   ```html
   <video loop autoplay muted playsinline>
     <source src="coin.mp4" type="video/mp4">
   </video>
   ```

---

## 🎓 Next Steps

### Improve Animation
- Add motion blur (Render Properties → Motion Blur)
- Add depth of field (Camera → Depth of Field)
- Add floor plane for reflection
- Adjust lighting colors

### Advanced Techniques
- Physics simulation for realistic fall
- Particle effects on coin edge
- Multiple coins sequence
- Custom backgrounds

### Share Your Work
- Export frames: Output → PNG sequence
- Create thumbnail: Render single frame
- Add sound effects (post-production)

---

## 📚 Resources

- **Full guide**: `documentation/blender-coin-animation-guide.md`
- **Blender manual**: https://docs.blender.org/
- **r/blender**: https://reddit.com/r/blender
- **Blender Artists**: https://blenderartists.org/

---

## 💡 Pro Tips

1. **Save often**: `Ctrl+S` every few minutes
2. **Test renders**: Render frame 72 (middle) first
3. **Preview animation**: Use Eevee for fast preview
4. **Backup project**: Save as "coin-v1.blend", "coin-v2.blend", etc.
5. **Camera test**: Press `Numpad 0` frequently to check camera view

---

**Estimated total time**: 30-60 minutes (first time)  
**Render time**: 10-30 minutes (depends on hardware)  
**You got this! 🎬✨**
