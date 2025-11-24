import React from "react";
import { useNavigate, useParams } from "react-router-dom"
import { roomNameRegex } from "../types";

export const withRoomNameProps = {

}

const withRoomName = <T extends object>(WrappedComponent: React.ComponentType<T>) => {
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

export default withRoomName;