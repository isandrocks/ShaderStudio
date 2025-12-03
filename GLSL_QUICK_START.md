# GLSL Quick Start Guide for Shader Studio

This guide will help you get started with writing custom GLSL shaders in the **Advanced Editor** of Shader Studio. GLSL (OpenGL Shading Language) is a C-style language used to render effects on the GPU.

## 1. The Basics

Every shader in Shader Studio is a **Fragment Shader**. Its job is to calculate the color of every single pixel on your shape.

### Minimal Boilerplate
When you open the Advanced Editor, you'll typically see something like this:

```glsl
precision mediump float;

uniform vec2 iResolution; // Canvas size (width, height)
uniform float iTime;      // Time in seconds since start

void main() {
    // 1. Normalize coordinates (0.0 to 1.0)
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    // 2. Set the pixel color (Red, Green, Blue, Alpha)
    vec4 col = vec4(1.0, 0.0, 0.0, 1.0); // This Will give you a Solid Red
    gl_FragColor = col; // gl_FragColor is the variable that exports to the screen and must be a vec4
}
```

## 2. Built-in Variables

These variables are always available to you:

| Variable | Type | Description |
| :--- | :--- | :--- |
| `gl_FragCoord` | `vec4` | The absolute (x, y) coordinate of the current pixel. |
| `gl_FragColor` | `vec4` | The final output color of the pixel (RGBA). |
| `iResolution` | `vec2` | The dimensions of the canvas in pixels. |
| `iTime` | `float` | The elapsed time in seconds. Used for animation. |

## 3. Coordinate System (UVs)

To make shaders that look the same at any size, we "normalize" the coordinates.

```glsl
vec2 uv = gl_FragCoord.xy / iResolution.xy;
```
*   `uv.x` goes from **0.0** (left) to **1.0** (right).
*   `uv.y` goes from **0.0** (bottom) to **1.0** (top).

**Correcting Aspect Ratio:**
If you want circles to look like circles (not ovals) on non-square shapes:
```glsl
uv.x *= iResolution.x / iResolution.y;
```

## 4. Making Your First Shaders

### Example A: A Simple Gradient
Mix two colors based on the X coordinate.

```glsl
precision mediump float;
uniform vec2 iResolution;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    vec3 colorA = vec3(0.0, 0.0, 1.0); // Blue
    vec3 colorB = vec3(1.0, 0.0, 1.0); // Pink

    // Mix A and B based on uv.x (0 to 1)
    vec3 finalColor = mix(colorA, colorB, uv.x);

    gl_FragColor = vec4(finalColor, 1.0);
}
```

### Example B: Animated Colors
Use `sin(iTime)` to cycle values over time. `sin` returns values between -1 and 1, so we often map it to 0-1.

```glsl
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    // Oscillate red amount over time
    float red = 0.5 + 0.5 * sin(iTime); 
    
    gl_FragColor = vec4(red, uv.y, 0.5, 1.0);
}
```

### Example C: Drawing a Circle
Distance fields are the secret to drawing shapes.

```glsl
precision mediump float;
uniform vec2 iResolution;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    
    // Center the coordinates (0,0 is now middle)
    uv = uv - 0.5;
    
    // Fix aspect ratio
    uv.x *= iResolution.x / iResolution.y;

    // Calculate distance from center
    float dist = length(uv);
    
    // Create a sharp circle with radius 0.3
    // step(edge, value) returns 0.0 if value < edge, else 1.0
    float circle = 1.0 - step(0.3, dist);

    gl_FragColor = vec4(vec3(circle), 1.0);
}
```

## 5. Using Custom Uniforms

Shader Studio allows you to create sliders and color pickers without coding UI.

1.  **In the UI**: Click the **+** button to add a parameter.
    *   Name: `uMyColor`
    *   Type: `Color (vec3)`
2.  **In the Code**: Declare it at the top of your shader.

```glsl
precision mediump float;
uniform vec2 iResolution;

// Declare your custom uniform here!
uniform vec3 uMyColor; 

void main() {
    gl_FragColor = vec4(uMyColor, 1.0);
}
```

## 6. Essential Functions Cheat Sheet

| Function | Description |
| :--- | :--- |
| `mix(x, y, a)` | Linear interpolation between x and y by a. |
| `step(edge, x)` | Returns 0.0 if x < edge, else 1.0. Hard edges. |
| `smoothstep(e0, e1, x)` | Smooth interpolation between e0 and e1. Soft edges. |
| `length(v)` | Returns the length of vector v. |
| `distance(p1, p2)` | Distance between two points. |
| `sin(x)`, `cos(x)` | Trigonometry (input in radians). |
| `fract(x)` | Returns the fractional part of x (e.g., 1.25 -> 0.25). Good for repeating patterns. |

## 7. Pro Tips

### Vector Swizzling
GLSL allows you to access vector components in any order using `.xyzw`, `.rgba`, or `.stpq`.
```glsl
vec4 color = vec4(1.0, 0.5, 0.0, 1.0);
vec3 rgb = color.rgb;      // (1.0, 0.5, 0.0)
vec2 reversed = color.bg;  // (0.0, 0.5) - Blue, Green
vec3 allRed = color.rrr;   // (1.0, 1.0, 1.0)
```

### Type Strictness
GLSL is very strict about types. You cannot mix integers and floats.
*   ❌ `float x = 1;` (Error)
*   ✅ `float x = 1.0;` (Correct)
*   ❌ `vec3 col = vec3(1, 0, 0);` (Error)
*   ✅ `vec3 col = vec3(1.0, 0.0, 0.0);` (Correct)

### Defining Constants
If you need Pi or other constants, define them at the top of your file.
```glsl
#define PI 3.14159265359
#define TWO_PI 6.28318530718
```

### Performance Note
Avoid complex `if` statements and loops inside shaders when possible, as they can be slow on some GPUs. Use `step`, `mix`, and math functions instead.

## 8. Debugging Tips

*   **Syntax Errors**: If the screen goes black or shows an error overlay, check your semicolons `;` and variable types (you can't mix `int` and `float` easily!).
*   **Visual Debugging**: Output values as colors. If you want to see the value of a variable `val`, try `gl_FragColor = vec4(vec3(val), 1.0);`.
*   **Coordinate Check**: `gl_FragColor = vec4(uv.x, uv.y, 0.0, 1.0);` gives you a nice Red/Green gradient to verify your UVs are correct.
