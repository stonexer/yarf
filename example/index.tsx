import { createElement } from '../src/createElement';
import { render } from '../src/dom/render';

const Comp = () => {
  return <div>11</div>;
};

const App = () => {
  return (
    <div>
      Hello <span>World</span>
      <div>Lalala</div>
      <Comp />
      <Comp />
    </div>
  );
};

render(<App />, document.getElementById('root')!);
