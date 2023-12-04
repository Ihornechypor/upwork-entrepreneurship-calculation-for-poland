import { Footer, Main } from './components/Layout';
import Section from './components/Section';
import Controller from './components/Controller/index.tsx';
import GlobalStyle from './styles/globalStyles';

function App() {
  return (
    <>
      <GlobalStyle />
      <Main>
        <Section>
          <h1>Paste csv code inside textarea</h1>
          <Controller />
        </Section>
      </Main>
      <Footer>Tool to calculate unregistred entrepreneurship for Poland for Upwork users</Footer>
    </>
  );
}

export default App;
