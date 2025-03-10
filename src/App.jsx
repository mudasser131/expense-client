import React from 'react'
import { Routes, Route, Router } from 'react-router-dom';
import Navbar from './components/Navbar'
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Footer from './components/Footer';

const App = () => {
  return (

  
    <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow mt-16">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </main>
    <Footer />
  </div>

  )
}

export default App