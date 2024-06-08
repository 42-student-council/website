import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Issues = () => {
    const [issues, setIssues] = useState([]);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const result = await axios(`${API_BASE_URL}/issue/view/all/`);
                setIssues(result.data);
                console.log('Issues fetched:', result.data);
            } catch (error) {
                console.error('Error fetching issues:', error);
            }
        };

        fetchIssues();
    }, [API_BASE_URL]);

    return (
        <div>
            <h2>All Issues</h2>
            <ul>
                {issues.map((issue) => (
                    <li key={issue.id}>
                        <Link to={`/issues/${issue.id}`}>
                            <h3>{issue.title}</h3>
                        </Link>
                        <p>{issue.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};
