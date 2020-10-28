import React, { useState } from "react";
import styled from "styled-components";
import { useHistory } from 'react-router-dom';
import { Input, Button } from "@material-ui/core";
import { login } from "services/fetch-actions/httpApi";

const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 65px;
  height: 250px;
  justify-content: space-evenly;
  align-items: center;
  background: #172333;
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

export const BeehiveLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory()

  const onSubmit = async () => {
    try {
      const response = await login(email, password)
      history.push('/admin')
      console.log(response)
    } catch(error) {
      console.log(error)
    }
  };

  const onChangeEmail = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    console.log(event);
    setEmail(event.currentTarget.value);
  };

  const onChangePassword = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    console.log(event);
    setPassword(event.currentTarget.value);
  };

  return (
    <PageWrapper>
      <InputsContainer>
        <Input
          placeholder={"Email"}
          value={email}
          onChange={onChangeEmail}
        />
        <Input
          placeholder={"Password"}
          type='password'
          value={password}
          onChange={onChangePassword}
        />
        <Button
          variant={"outlined"}
          color={"primary"}
          onClick={onSubmit}
          fullWidth={true}
        >
          Login
        </Button>
      </InputsContainer>
    </PageWrapper>
  );
};
