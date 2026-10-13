export function openModal(dialog, document, window, returnFocusElement) {
    const previousFocus = returnFocusElement || document.activeElement;
    const elements = [document.documentElement, document.body];
    const styles = elements.map((element) => ({
        element,
        overflow: element.style.getPropertyValue("overflow"),
        overflowPriority: element.style.getPropertyPriority("overflow"),
        paddingRight: element.style.getPropertyValue("padding-right"),
        paddingPriority: element.style.getPropertyPriority("padding-right"),
    }));
    const hasStableGutter = window.CSS?.supports("scrollbar-gutter", "stable");
    const scrollbarWidth = hasStableGutter ? 0 : Math.max(0, window.innerWidth - document.documentElement.clientWidth);

    const restore = () => {
        if (dialog.open) dialog.close();
        for (const { element, overflow, overflowPriority, paddingRight, paddingPriority } of styles) {
            if (overflow) element.style.setProperty("overflow", overflow, overflowPriority);
            else element.style.removeProperty("overflow");
            if (paddingRight) element.style.setProperty("padding-right", paddingRight, paddingPriority);
            else element.style.removeProperty("padding-right");
        }
        if (previousFocus?.isConnected && !previousFocus.disabled) previousFocus.focus({ preventScroll: true });
    };

    if (scrollbarWidth > 0) {
        const padding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
        document.body.style.setProperty("padding-right", `${padding + scrollbarWidth}px`);
    }
    for (const element of elements) element.style.setProperty("overflow", "hidden");

    try {
        dialog.showModal();
        dialog.querySelector("[data-modal-initial-focus]")?.focus({ preventScroll: true });
    } catch (error) {
        restore();
        throw error;
    }

    return restore;
}