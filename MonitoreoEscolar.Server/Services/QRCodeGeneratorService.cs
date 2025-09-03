using ZXing;
using ZXing.Common;
using ZXing.QrCode;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

public static class QRCodeGeneratorService
{
    public static byte[] GenerarQRCode(string contenido)
    {
        var qrWriter = new BarcodeWriterPixelData
        {
            Format = BarcodeFormat.QR_CODE,
            Options = new QrCodeEncodingOptions
            {
                Height = 200,
                Width = 200,
                Margin = 1
            }
        };

        var pixelData = qrWriter.Write(contenido);

        using var bitmap = new Bitmap(pixelData.Width, pixelData.Height, PixelFormat.Format32bppRgb);
        var bitmapData = bitmap.LockBits(new Rectangle(0, 0, pixelData.Width, pixelData.Height),
                                         ImageLockMode.WriteOnly, PixelFormat.Format32bppRgb);
        System.Runtime.InteropServices.Marshal.Copy(pixelData.Pixels, 0, bitmapData.Scan0, pixelData.Pixels.Length);
        bitmap.UnlockBits(bitmapData);

        using var stream = new MemoryStream();
        bitmap.Save(stream, ImageFormat.Png);
        return stream.ToArray();
    }
}