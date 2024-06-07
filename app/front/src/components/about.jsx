import React from "react";

export const About = (props) => {
  const paragraph = props.data 
    ? props.data.paragraph.replace(/\n/g, '<br>') 
    : 'loading...';
  const why = props.data
    ? props.data.why.replace(/\n/g, '<br>')
    : 'loading...';

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
              <h2>What is the Student Council?</h2>
              <p dangerouslySetInnerHTML={{ __html: paragraph }} />
              <h3 style={{ marginBottom: '1px' }}>WHY?</h3>
              <p style={{ marginTop: '1px' }} dangerouslySetInnerHTML={{ __html: why }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};