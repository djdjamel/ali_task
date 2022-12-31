
import React,{useState, useRef, useContext} from 'react'
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react'
import { AuthContext } from '../components/auth-context';
import {Navigate } from "react-router-dom";
import userLogo from '../../img/user.png';


const LoginForm = () => {
  const [message, setMessage] = useState('');
  const email = useRef('');
  const password = useRef('');

  const authCtx = useContext(AuthContext);
  authCtx.checkLogAlive();

  const onEmailHandler = (e)=> {
    const txt = e.target.value;
    email.current = txt;
  }

  const onPasswordHandler = (e)=> {
    const txt = e.target.value;
    password.current = txt;
  }

  const onFormSubmit = (event) => {
    event.preventDefault();

    if(!email) {
      setMessage("Email vide!");
      return;
    }

    if(email.current.indexOf('@') === -1) {
      setMessage('Email incorrect!')
      return;
    }

    if(!password.current) {
      setMessage('mot de passe vide!')
      return;
    }

    authCtx.login(email.current, password.current, setMessage);

  }

  return ( authCtx.isLoggedIn ? <Navigate to="/api/dashboard" /> 
                              :
  <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 450 }}>
      <Header as='h2' color='teal' textAlign='center'>
        <Image src={userLogo} /> Log-in to your account
      </Header>
      <Form size='large'  onSubmit={(event) => onFormSubmit(event)}>
        <Segment stacked>

          <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address' 
            onChange={(e)=> onEmailHandler(e)}/>
          <Form.Input fluid icon='lock' iconPosition='left' placeholder='Password' type='password' 
            onChange={(e)=> onPasswordHandler(e)}/>
          <Button color='teal' fluid size='large'>
            Login
          </Button>

        </Segment>
      </Form>
      {!!message && <Message>{message}</Message>}
      <Message>
        New to us? <a href='#'>Sign Up</a>
      </Message>
    </Grid.Column>
  </Grid>
)}

export default LoginForm