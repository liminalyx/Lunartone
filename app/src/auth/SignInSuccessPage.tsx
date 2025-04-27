import styled from "@emotion/styled"
import { FC } from "react"

const Container = styled.div`
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.darkBackgroundColor};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 30rem;
  margin: 10rem auto;
`

const Title = styled.h1`
  color: ${({ theme }) => theme.themeColor};
`

const Text = styled.p`
  color: ${({ theme }) => theme.secondaryTextColor};
`

export const SignInSuccessPage: FC = () => {
  return (
    <Container>
      <Title>Аутентификация Сәтті Өтті</Title>
      <Text>Енді сіз бұл бетті жаба аласыз.</Text>
      <Text>Lunatone қолданғаныңыз үшін рахмет.</Text>
    </Container>
  )
}
