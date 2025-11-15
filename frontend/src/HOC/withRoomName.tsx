import React, { ReactElement, ReactHTMLElement } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { roomNameRegex } from "../types";

export const withRoomNameProps = {

}

export const withRoomName = <T extends object>(WrappedComponent: React.ComponentType<T>) => {
    return (props: T) => {
        const { name } = useParams;
        const navigate = useNavigate();

        if (!name || !roomNameRegex.test(name)) {
            navigate('/');
        }

        return (
            <WrappedComponent {...props} name={name} />
        )
    }
}