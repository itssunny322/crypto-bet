import React from "react";

import './Loader.scss'

const Loader = () => {
    return (
        <div class="card">
            <h4>Transaction processing</h4>
            <p>Please wait for a while</p>
            <div class="loader">
                <div class="spin"></div>
                <div class="bounce"></div>
            </div>
        </div>
    );
    }

    export default Loader;
    