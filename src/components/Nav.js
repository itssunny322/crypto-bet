import React from "react";
import { Link } from "react-router-dom";

export default function Nav() {
  return (
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <Link to="/" class="navbar-brand">Circle Bet </Link>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNavAltMarkup"
        aria-controls="navbarNavAltMarkup"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav">

          <Link to={"/"} class="nav-item nav-link active" >Home</Link>
          <Link to={"/wallet"} class="nav-item nav-link active"> Wallet </Link>
          <Link to={"/store"} class="nav-item nav-link active"> Store </Link>

          
          <a class="nav-item nav-link" href="#">
          Bet History
          </a>
        </div>
      </div>
    </nav>
  );
}
