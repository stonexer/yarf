import { createElement } from '../src/createElement';
import { render } from '../src/dom/render';

const App = () => {
  return (
    <div>
      Hello <span>World</span>
    </div>
  );
};

console.log(<App />);

render(<App />, document.getElementById('#root')!);
