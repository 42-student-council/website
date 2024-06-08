import React from "react";

export const Navigation = (props) => {
    const handleNavClick = (e, target) => {
        e.preventDefault();
        const element = document.querySelector(target);
        const offset = 100;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
        });
    };

    return (
        <nav id="menu" className="navbar navbar-default navbar-fixed-top">
            <div className="container">
                <div className="navbar-header">
                    <button
                        type="button"
                        className="navbar-toggle collapsed"
                        data-toggle="collapse"
                        data-target="#bs-example-navbar-collapse-1"
                    >
                        {" "}
                        <span className="sr-only">Toggle navigation</span> <span className="icon-bar"></span>{" "}
                        <span className="icon-bar"></span> <span className="icon-bar"></span>{" "}
                    </button>
                    <a className="navbar-brand page-scroll" href="#page-top">
                        Student Council
                    </a>{" "}
                </div>

                <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul className="nav navbar-nav navbar-right">
                        <li>
                            <a href="#about" className="page-scroll" onClick={(e) => handleNavClick(e, "#about")}>
                                About
                            </a>
                        </li>
                        <li>
                            <a href="#issue" className="page-scroll" onClick={(e) => handleNavClick(e, "#issue")}>
                                Raise an issue
                            </a>
                        </li>
                        <li>
                            <a href="#contact" className="page-scroll" onClick={(e) => handleNavClick(e, "#contact")}>
                                Contact
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};
