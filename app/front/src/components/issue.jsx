import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const Issue = () => {
    const [issue, setIssue] = useState(null);
    const { id } = useParams();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const result = await axios.get(`${API_BASE_URL}/issues/view/${id}/`);
                setIssue(result.data);
                console.log('Issue fetched:', result.data);
            } catch (error) {
                console.error('Error fetching issue:', error);
            }
        };

        fetchIssue();
    }, [API_BASE_URL, id]);

    if (!issue) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>
                {issue.id}. {issue.title}
            </h2>
            <p>{issue.description}</p>
        </div>
    );
};
