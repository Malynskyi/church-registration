import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { openModal } from "./modalLifecycle";

export default function Modal({ titleId, descriptionId, title, children, success = false, returnFocusRef }) {
    const dialogRef = useRef(null);

    useEffect(() => openModal(dialogRef.current, document, window, returnFocusRef?.current), [returnFocusRef]);

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal-overlay"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onCancel={(event) => event.preventDefault()}
        >
            <div className={`modal${success ? " modal-success" : ""}`}>
                <div className="modal-icon" aria-hidden="true">✓</div>
                <h2 id={titleId}>{title}</h2>
                {children}
            </div>
        </dialog>,
        document.body,
    );
}