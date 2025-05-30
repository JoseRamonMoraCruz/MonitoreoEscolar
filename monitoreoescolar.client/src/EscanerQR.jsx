import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import beepSound from "./assets/beep.mp3";
import { Html5Qrcode } from "html5-qrcode";

const EscanerQR = ({ onScanSuccess, idQr = "qr-reader" }) => {
    const scannerRef = useRef(null);
    const yaEscaneadoRef = useRef(false);

    useEffect(() => {
        const el = document.getElementById(idQr);
        if (!el) {
            console.error("❌ No se encontró el contenedor del escáner:", idQr);
            return;
        }

        const scanner = new Html5Qrcode(idQr);
        scannerRef.current = scanner;
        yaEscaneadoRef.current = false;

        Html5Qrcode.getCameras()
            .then(devices => {
                if (devices && devices.length > 0) {
                    const cameraId = devices[0].id;
                    scanner.start(
                        cameraId,
                        { fps: 10, qrbox: 250 },
                        async (decodedText) => {
                            if (yaEscaneadoRef.current) return;
                            yaEscaneadoRef.current = true;

                            const audio = new Audio(beepSound);
                            await audio.play().catch(console.error);

                            console.log("✅ Código escaneado:", decodedText);
                            await onScanSuccess(decodedText);

                            scanner.stop()
                                .then(() => scanner.clear())
                                .catch((err) => console.warn("Error al detener el escáner:", err));
                        },
                        () => { /* ignorar errores */ }
                    );
                } else {
                    console.warn("No se encontraron cámaras.");
                }
            })
            .catch(err => {
                console.error("Error al obtener cámaras:", err);
            });

        return () => {
            if (scannerRef.current && scannerRef.current._isScanning) {
                scannerRef.current.stop()
                    .then(() => scannerRef.current.clear())
                    .catch(() => { });
            }
        };
    }, [onScanSuccess, idQr]);

    return (
        <div>
            <div
                id={idQr}
                style={{
                    width: "100%",
                    maxWidth: "500px",
                    height: "400px",
                    margin: "0 auto",
                    backgroundColor: "#000",
                    borderRadius: "12px",
                    overflow: "hidden",
                }}
            ></div>
        </div>
    );
};

EscanerQR.propTypes = {
    onScanSuccess: PropTypes.func.isRequired,
    idQr: PropTypes.string
};

export default EscanerQR;
