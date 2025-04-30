# Excel Analytics Platform

A powerful web application that enables users to upload Excel files, analyze data, and generate interactive 2D and 3D visualizations. Built with the MERN stack, this platform provides an intuitive interface for data analysis and visualization.

## 🌟 Features

- **User Authentication**
  - Secure registration and login system
  - JWT-based authentication
  - Password reset functionality

- **Excel File Management**
  - Upload .xls and .xlsx files
  - File format validation
  - Upload history tracking
  - File deletion capability

- **Data Visualization**
  - Interactive 2D charts (bar, line, pie, scatter)
  - 3D visualizations
  - Customizable chart appearance
  - Download charts as PNG/PDF

- **AI-Powered Insights**
  - Automated data analysis
  - AI-generated insights
  - Summary reports

- **Admin Panel**
  - User management
  - System statistics
  - Activity monitoring

## 🛠️ Technology Stack

### Frontend
- React.js
- Redux Toolkit
- Tailwind CSS
- Chart.js (2D visualizations)
- Three.js (3D visualizations)
- Axios
- React Router
- SheetJS/xlsx
- React-to-print/jsPDF

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer
- SheetJS/xlsx
- Gemini AI API (optional)

### DevOps
- Git/GitHub
- Render (Backend)
- Vercel (Frontend)
- MongoDB Atlas

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/excel-analytics-platform.git
cd excel-analytics-platform
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd ../frontend
npm start
```

## 📋 Project Structure

```
excel-analytics-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   └── utils/
│   └── public/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── config/
└── README.md
```

## 🔒 Security Features

- HTTPS encryption
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation
- Data isolation

## 📊 Performance Metrics

- Page load time: < 3 seconds
- Chart generation: < 5 seconds
- File upload processing: < 30 seconds (files up to 10MB)
- Support for up to 100 concurrent users
- Handle up to 1000 stored files

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Chart.js for visualization capabilities
- Three.js for 3D rendering
- MongoDB Atlas for database hosting
- Render and Vercel for deployment services

## 📞 Support

For support, email support@excelanalytics.com or create an issue in the repository.

## 🔄 Future Enhancements

- Mobile application development
- Real-time collaborative editing
- Integration with external data sources
- Advanced statistical analysis tools
- Custom chart type creation
- Team collaboration features 