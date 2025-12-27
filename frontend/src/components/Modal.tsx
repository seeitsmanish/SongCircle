import React from 'react';

type ModalPropsTypes = {
    title: string;
    message: string;
    onClose: () => void;
    onSubmit: () => void;
    submitText: React.ReactNode | string;
    closeText: string;
    icon?: React.ReactNode;
}
const Modal = ({
    title,
    message,
    onClose,
    onSubmit,
    submitText,
    closeText,
    icon
}: ModalPropsTypes) => {
    return (
        <div className="fixed z-[100000] inset-0 bg-black bg-opacity-80 h-screen w-screen overflow-hidden flex justify-center items-center">
            <div className='bg-black border border-primary/70 rounded-lg shadow-lg w-11/12 md:w-1/3 p-6'>
                <div className="flex flex-col items-start">
                    <div className='flex gap-5 items-center mb-4'>
                        {icon && <div>{icon}</div>}
                        <h2 className="text-2xl font-bold text-white ">{title}</h2>
                    </div>
                    <p className="text-gray-300 mb-4">{message}</p>
                    <div className="flex space-x-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                        >
                            {closeText}
                        </button>
                        <button
                            onClick={onSubmit}
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
                        >
                            {submitText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;