# Generates favicons, PWA icons, and og-image.png from public/apple-touch-icon.png source.
# Run: pwsh -File scripts/generate-seo-assets.ps1
Add-Type -AssemblyName System.Drawing

$publicDir = Join-Path $PSScriptRoot "..\public"
$sourcePath = Join-Path $publicDir "apple-touch-icon.png"

Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Collections.Generic;

public static class SeoAssetGenerator
{
    private static Image LoadImage(string path)
    {
        byte[] bytes = File.ReadAllBytes(path);
        var ms = new MemoryStream(bytes);
        return Image.FromStream(ms);
    }

    public static void ResizeSquare(string srcPath, string destPath, int size)
    {
        using (var src = LoadImage(srcPath))
        using (var bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb))
        {
            using (var g = Graphics.FromImage(bmp))
            {
                g.CompositingMode = CompositingMode.SourceOver;
                g.CompositingQuality = CompositingQuality.HighQuality;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.SmoothingMode = SmoothingMode.HighQuality;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.Clear(Color.Transparent);
                g.DrawImage(src, 0, 0, size, size);
            }
            bmp.Save(destPath, ImageFormat.Png);
        }
    }

    public static void BuildIco(string destPath, int[] sizes, string sourcePath)
    {
        var pngBytesList = new List<byte[]>();
        foreach (var size in sizes)
        {
            using (var src = LoadImage(sourcePath))
            using (var bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb))
            {
                using (var g = Graphics.FromImage(bmp))
                {
                    g.CompositingQuality = CompositingQuality.HighQuality;
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.Clear(Color.Transparent);
                    g.DrawImage(src, 0, 0, size, size);
                }
                using (var ms = new MemoryStream())
                {
                    bmp.Save(ms, ImageFormat.Png);
                    pngBytesList.Add(ms.ToArray());
                }
            }
        }

        using (var fs = new FileStream(destPath, FileMode.Create, FileAccess.Write))
        using (var bw = new BinaryWriter(fs))
        {
            // ICONDIR
            bw.Write((short)0); // reserved
            bw.Write((short)1); // type: icon
            bw.Write((short)sizes.Length); // count

            int offset = 6 + (16 * sizes.Length);
            for (int i = 0; i < sizes.Length; i++)
            {
                int size = sizes[i];
                byte b = (byte)(size >= 256 ? 0 : size);
                bw.Write(b); // width
                bw.Write(b); // height
                bw.Write((byte)0); // color palette
                bw.Write((byte)0); // reserved
                bw.Write((short)1); // color planes
                bw.Write((short)32); // bits per pixel
                bw.Write(pngBytesList[i].Length); // size of image data
                bw.Write(offset); // offset of image data
                offset += pngBytesList[i].Length;
            }

            foreach (var data in pngBytesList)
            {
                bw.Write(data);
            }
        }
    }

    public static void ComposeOgImage(string charPath, string destPath, string line1, string line2, string bgHex, string accentHex)
    {
        int width = 1200, height = 630;
        using (var bmp = new Bitmap(width, height, PixelFormat.Format32bppArgb))
        {
            using (var g = Graphics.FromImage(bmp))
            {
                g.CompositingQuality = CompositingQuality.HighQuality;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.SmoothingMode = SmoothingMode.HighQuality;
                g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAlias;

                Color bg = ColorTranslator.FromHtml(bgHex);
                Color accent = ColorTranslator.FromHtml(accentHex);

                g.Clear(bg);

                // subtle grid pattern
                using (var gridPen = new Pen(Color.FromArgb(18, 255, 255, 255), 1))
                {
                    for (int x = 0; x < width; x += 40) g.DrawLine(gridPen, x, 0, x, height);
                    for (int y = 0; y < height; y += 40) g.DrawLine(gridPen, 0, y, width, y);
                }

                // character illustration on the left
                using (var charImg = LoadImage(charPath))
                {
                    int charSize = 480;
                    int charX = 40;
                    int charY = (height - charSize) / 2;
                    g.DrawImage(charImg, charX, charY, charSize, charSize);
                }

                // text block on the right
                int textX = 560;
                using (var titleFont = new Font("Segoe UI", 64, FontStyle.Bold, GraphicsUnit.Pixel))
                using (var subFont = new Font("Segoe UI", 30, FontStyle.Regular, GraphicsUnit.Pixel))
                using (var titleBrush = new SolidBrush(Color.White))
                using (var subBrush = new SolidBrush(accent))
                {
                    g.DrawString(line1, titleFont, titleBrush, new PointF(textX, 210));
                    g.DrawString(line2, subFont, subBrush, new PointF(textX, 300));
                }
            }
            bmp.Save(destPath, ImageFormat.Png);
        }
    }

    public static void BuildFaviconSvg(string srcPath, string destPath, int embedSize)
    {
        using (var src = LoadImage(srcPath))
        using (var bmp = new Bitmap(embedSize, embedSize, PixelFormat.Format32bppArgb))
        {
            using (var g = Graphics.FromImage(bmp))
            {
                g.CompositingQuality = CompositingQuality.HighQuality;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.SmoothingMode = SmoothingMode.HighQuality;
                g.Clear(Color.Transparent);
                g.DrawImage(src, 0, 0, embedSize, embedSize);
            }
            using (var ms = new MemoryStream())
            {
                bmp.Save(ms, ImageFormat.Png);
                string b64 = Convert.ToBase64String(ms.ToArray());
                string svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 " + embedSize + " " + embedSize + "\"><image width=\"" + embedSize + "\" height=\"" + embedSize + "\" href=\"data:image/png;base64," + b64 + "\"/></svg>";
                File.WriteAllText(destPath, svg);
            }
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

[SeoAssetGenerator]::ResizeSquare($sourcePath, (Join-Path $publicDir "apple-touch-icon.png"), 180)
[SeoAssetGenerator]::ResizeSquare($sourcePath, (Join-Path $publicDir "favicon-96x96.png"), 96)
[SeoAssetGenerator]::ResizeSquare($sourcePath, (Join-Path $publicDir "web-app-manifest-192x192.png"), 192)
[SeoAssetGenerator]::ResizeSquare($sourcePath, (Join-Path $publicDir "web-app-manifest-512x512.png"), 512)
[SeoAssetGenerator]::BuildIco((Join-Path $publicDir "favicon.ico"), @(16, 32, 48), $sourcePath)
[SeoAssetGenerator]::BuildFaviconSvg($sourcePath, (Join-Path $publicDir "favicon.svg"), 512)
[SeoAssetGenerator]::ComposeOgImage(
    $sourcePath,
    (Join-Path $publicDir "og-image.png"),
    "Đỗ Quốc Việt",
    "Software Engineer @ VNPT Group | vietdoo",
    "#171717",
    "#7dd3fc"
)

Write-Host "SEO assets generated successfully in $publicDir"
