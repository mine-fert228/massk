import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import QRCodeStyling from "qr-code-styling";

const QRCodeComponent = forwardRef(({ data }, ref) => {
    const qrRef = useRef(null);
    const qrCode = useRef(null);

    useEffect(() => {
        // Создание экземпляра только один раз
        qrCode.current = new QRCodeStyling({
            width: 250,
            height: 250,
            image: "https://cdn.jsdelivr.net/gh/pupsikdhd/ProjectCDN/main-logo-white.svg",
            data: data || "otpauth://totp/ExampleApp:you@example.com?secret=ABC123DEF456&issuer=ExampleApp",
            dotsOptions: { color: "#000", type: "rounded" },
            backgroundOptions: { color: "#fff" },
        });

        if (qrRef.current) {
            qrCode.current.append(qrRef.current);
        }

        return () => {
            if (qrRef.current) qrRef.current.innerHTML = "";
        };
    }, []);

    // обновление QR при изменении пропса `data`
    useEffect(() => {
        if (qrCode.current && data) {
            qrCode.current.update({ data });
        }
    }, [data]);

    useImperativeHandle(ref, () => ({
        update(newData) {
            if (qrCode.current) {
                qrCode.current.update({ data: newData });
            }
        },
    }));

    return <div ref={qrRef} />;
});

export default QRCodeComponent;

