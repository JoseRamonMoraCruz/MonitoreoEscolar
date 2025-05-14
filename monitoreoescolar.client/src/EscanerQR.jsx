import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import beepSound from "./assets/beep.mp3";
import { Html5Qrcode } from "html5-qrcode";

const EscanerQR = ({ onScanSuccess }) => {
    const scannerRef = useRef(null);
    const containerRef = useRef(null);
    const yaEscaneadoRef = useRef(false);

    useEffect(() => {
        const qrRegionId = "qr-reader";
        const scanner = new Html5Qrcode(qrRegionId);
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
            // Evitar error si ya fue detenido antes
            if (scannerRef.current && scannerRef.current._isScanning) {
                scannerRef.current.stop()
                    .then(() => scannerRef.current.clear())
                    .catch(() => { });
            }
        };
    }, [onScanSuccess]);

    return (
        <div>
            <div
                ref={containerRef}
                id="qr-reader"
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
    onScanSuccess: PropTypes.func.isRequired
};

export default EscanerQR;
