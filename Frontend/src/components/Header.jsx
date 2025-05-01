

const Header = () => {
    return(
        <>
        <header className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex">
        <img
              alt="Company Logo"
              src="https://images.unsplash.com/vector-1739889219750-1aedc85afd61?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              className="mx-auto h-10 w-auto logo"
            />
          <a href="#" className="-m-1 p-1">
            <h1 className='work-sans-headerName'>
              Excel Analyzer Platform 
            </h1>
          </a>
        </div>
      </nav>
    </header>
        </>
    )
};

export default Header;