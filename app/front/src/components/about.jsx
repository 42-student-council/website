import React from "react";
import { formatParagraph } from "../utils";

export const About = ({ data = { title: "loading...", paragraph: "loading...", why: "loading..." } }) => {
    const title = formatParagraph(data.title);
    const paragraph = formatParagraph(data.paragraph);
    const why = formatParagraph(data.why);

    return (
        <div id="about">
            <div className="container">
                <div className="row">
                    <div className="col-xs-12 col-md-6">
                        {" "}
                        <img src="img/landing-page.png" className="img-responsive" alt="" />{" "}
                    </div>
                    <div className="col-xs-12 col-md-6">
                        <div className="about-text">
                            <h2 dangerouslySetInnerHTML={{ __html: title }}></h2>
                            <p dangerouslySetInnerHTML={{ __html: paragraph }} />
                            <h3 style={{ marginBottom: "1px" }}>WHY?</h3>
                            <p style={{ marginTop: "1px" }} dangerouslySetInnerHTML={{ __html: why }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
