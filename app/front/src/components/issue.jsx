import React, { useState } from 'react';
import { formatParagraph } from '../utils';

export const Issue = ({ data = { title: 'loading...', paragraph: 'loading...' } }) => {
    const title = formatParagraph(data.title);
    const paragraph = formatParagraph(data.paragraph);
    const [issues, setIssues] = useState([]);
    const [issueTitle, setIssueTitle] = useState('');
    const [description, setDescription] = useState('');

    const createIssue = (issue) => {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
        fetch(`${API_BASE_URL}/issue/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(issue),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const newIssue = { title: issueTitle, description, created_at: new Date().toISOString() };
        createIssue(newIssue);
        setIssues([...issues, newIssue]);
        setIssueTitle('');
        setDescription('');
    };

    return (
        <div id='issue'>
            <div className='container'>
                <div className='col-md-8'>
                    <div className='row'>
                        <div className='section-title'>
                            <h2 dangerouslySetInnerHTML={{ __html: title }}></h2>
                            <p dangerouslySetInnerHTML={{ __html: paragraph }}></p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='form-group'>
                                        <input
                                            type='text'
                                            id='title'
                                            name='title'
                                            className='form-control'
                                            placeholder='Title'
                                            value={issueTitle}
                                            onChange={(event) => setIssueTitle(event.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='col-md-12'>
                                    <div className='form-group'>
                                        <textarea
                                            id='description'
                                            name='description'
                                            className='form-control'
                                            placeholder='Description'
                                            value={description}
                                            onChange={(event) => setDescription(event.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='clearfix'></div>
                                <div className='col-lg-12 text-center'>
                                    <div id='success'></div>
                                    <button type='submit' className='btn btn-custom btn-lg'>
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
