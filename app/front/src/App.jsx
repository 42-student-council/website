import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { About } from "./components/about";
import { Issue } from "./components/issue";
import { Contact } from "./components/contact";
import SmoothScroll from "smooth-scroll";
import "./App.css";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios(`${API_BASE_URL}/data/`);
        setLandingPageData(result.data);
        console.log('Data fetched:', result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  return (
    <div>
      <Navigation />
      <Header data={landingPageData.Header} />
      <About data={landingPageData.About} />
      <Issue data={landingPageData.Issue} />
      <Contact data={landingPageData.Contact} />
    </div>
  );
};

export default App;
