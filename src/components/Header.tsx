import React from 'react';

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground p-4">
      <h1 className="text-2xl font-bold">AI Solution Explorer</h1>
      <p className='text-xs'>All solutions are built using <a href="https://together.ai" target="_blank">Together AI</a></p>
    </header>
  );
};

export default Header;
