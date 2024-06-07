import React, { useState } from "react";

export const Issue = () => {
  const [issues, setIssues] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setIssues([...issues, { title, description }]);
    setTitle("");
    setDescription("");
  };

  return (
    <div id="issue">
        <div className="container">
            <div className="col-md-8">
                <div className="row">
                    <div className="section-title">
                        <h2>Something you want to change?</h2>
                        <p>
                            Please fill out the form below to raise an issue.
                        </p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        className="form-control"
                                        placeholder="Title"
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group">
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="form-control"
                                        placeholder="Description"
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="clearfix"></div>
                            <div className="col-lg-12 text-center">
                                <div id="success"></div>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                >
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};