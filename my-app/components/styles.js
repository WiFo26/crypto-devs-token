import styled from 'styled-components';

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 8px;
  overflow: hidden;
`;

export const Main = styled.main`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const MintSection = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: start;
  padding-right: 30px;
  & h1{
    font-size: 30px;
  }
  & p{
    font-size: 18px;
    margin-bottom: 20px;
  }
  & input{
    max-width: 300px;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid gray;
    margin: 12px 0px;
    
  }
  & button{
    max-width: 150px;
    padding: 8px;
    border-radius: 8px;
    border: none;
    color: white;
    background-color: blue;
  }
`

export const ImageSection = styled.section`
  padding-left: 30px;
`

export const ImageWrapper = styled.div`
    width: 350px;
    height: 500px;
`