import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from '../components/auth-context';
import LoginForm from './LoginForm';
import LandPage from './LandPage';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import Dashboard from './Dashboard';
import SharedDashboard from './SharedDashboard';
//import { Listing } from './Listing';
import 'semantic-ui-css/semantic.min.css';
import FeedBack from './FeedBack';
import Tache from './Tache';
import Plan from './Plan';

function Master() {
  return (
    <AuthProvider>
      <Message>
        New to us? <a href='#'>Sign Up</a>
      </Message>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<LandPage />} />
          <Route exact path="/api/login" element={<LoginForm />} />
          <Route exact path='/api/dashboard' element={<SharedDashboard/>}>
            <Route index element={<Dashboard/>}/>
            <Route path="feedback" element={<FeedBack />} />
            <Route path="tache" element={<Tache />} />
            <Route path="plan" element={<Plan />} />
          </Route>          
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default Master;

if (document.getElementById('master')) {
  ReactDOM.render(<Master />, document.getElementById('master'));
}