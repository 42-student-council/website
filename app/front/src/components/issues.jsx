import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

export const Issues = () => {
    const [issues, setIssues] = useState([]);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const result = await axios.get(`${API_BASE_URL}/issues/view/all/`);
                setIssues(result.data);
                console.log('Issues fetched:', result.data);
            } catch (error) {
                console.error('Error fetching issues:', error);
            }
        };

        fetchIssues();
    }, [API_BASE_URL]);

    useEffect(() => {
        console.log('Issues state updated:', issues);
    }, [issues]);

    return (
        <div className='issues-container'>
            <h2>All Issues</h2>
            <ul>
                {issues.length > 0 ? (
                    issues.map((issue) => (
                        <li key={issue.id}>
                            <Link to={`/issues/${issue.id}`} className='issue-link'>
                                {issue.id}. {issue.title}
                            </Link>
                        </li>
                    ))
                ) : (
                    <li>No issues found</li>
                )}
            </ul>
        </div>
    );
};
