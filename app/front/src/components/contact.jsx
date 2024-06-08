import { useState } from 'react';
import emailjs from 'emailjs-com';
import React from 'react';
import { formatParagraph } from '../utils';

const initialState = {
    intraLogin: '',
    message: '',
};
export const Contact = ({ data = { title: 'loading...', paragraph: 'loading...' } }) => {
    const title = formatParagraph(data.title);
    const paragraph = formatParagraph(data.paragraph);

    const [{ intraLogin, message }, setState] = useState(initialState);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState((prevState) => ({ ...prevState, [name]: value }));
    };
    const clearState = () => setState({ ...initialState });

    const handleSubmit = (e) => {
        e.preventDefault();
        {
        }
        emailjs
            .sendForm(
                process.env.REACT_APP_EMAILJS_SERVICE_ID,
                process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
                e.target,
                process.env.REACT_APP_EMAILJS_USER_ID,
            )
            .then(
                (result) => {
                    console.log(result.text);
                    clearState();
                },
                (error) => {
                    console.log(error.text);
                },
            );
    };
    return (
        <div>
            <div id='contact'>
                <div className='container'>
                    <div className='col-md-8'>
                        <div className='row'>
                            <div className='section-title'>
                                <h2 dangerouslySetInnerHTML={{ __html: title }}></h2>
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: paragraph,
                                    }}
                                ></p>
                            </div>
                            <form name='sentMessage' noValidate onSubmit={handleSubmit}>
                                <div className='row'>
                                    <div className='col-md-4'>
                                        <div className='form-group'>
                                            <input
                                                type='text'
                                                id='name'
                                                name='intraLogin'
                                                className='form-control'
                                                placeholder='Intra Login'
                                                required
                                                onChange={handleChange}
                                            />
                                            <p className='help-block text-danger'></p>
                                        </div>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <textarea
                                        name='message'
                                        id='message'
                                        className='form-control'
                                        rows='4'
                                        placeholder='Message'
                                        required
                                        onChange={handleChange}
                                    ></textarea>
                                    <p className='help-block text-danger'></p>
                                </div>
                                <div id='success'></div>
                                <button type='submit' className='btn btn-custom btn-lg'>
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className='col-md-3 col-md-offset-1 contact-info'></div>
                </div>
            </div>
            <div id='footer'>
                <div className='container text-center'></div>
            </div>
        </div>
    );
};
