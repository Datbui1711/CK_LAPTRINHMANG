import useToast from "./useToast";

const useToastActions = () => {
    const { addToast } = useToast();

    return {
        success: (message, title, options) =>
            addToast({ type: "success", message, title, ...options }),

        error: (message, title, options) =>
            addToast({ type: "error", message, title, ...options }),

        warning: (message, title, options) =>
            addToast({ type: "warning", message, title, ...options }),

        info: (message, title, options) =>
            addToast({ type: "info", message, title, ...options }),
    };
};

export default useToastActions;
