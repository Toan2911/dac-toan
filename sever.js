const express = require('express')
const app = express()
const port = 5000
const router = express.Router();
// Import thư viện mongoose
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const webRouter = require('./src/routes/web')
const configviewengine = require('./src/config/viewengine');
app.use(express.json())
app.use(bodyParser.json());
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
configviewengine(app);
app.use('/api/admin', webRouter);
app.use('/', webRouter);
app.use('/api/login', webRouter);
app.use('/api/register', webRouter);
app.use('/api/admin/users', webRouter);
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// URL kết nối đến MongoDB Atlas
const dbURI = 'mongodb+srv://demo:123@cluster0.qdwwh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Kết nối đến MongoDB Atlas
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Kết nối MongoDB Atlas thành công!');
    })
    .catch((err) => {
        console.log('Lỗi kết nối MongoDB Atlas: ', err);
    });
// Cấu hình Express để sử dụng EJS và body-parser


// Định nghĩa schema cho tài khoản người dùng
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },  // Thêm trường role
});

// Tạo model người dùng
const User = mongoose.model('User', userSchema);

// API để đăng ký tài khoản người dùng mới
app.post('/api/register', async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    try {
        // Mã hóa mật khẩu trước khi lưu
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword, role: role || 'user' });
        await newUser.save();

        res.status(201).json({ message: 'Tài khoản đã được tạo thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra khi tạo tài khoản.' });
    }
});

// API để đăng nhập (login)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin đăng nhập.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email không đúng hoặc người dùng không tồn tại.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng.' });
        }



        const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, 'secretKey', { expiresIn: '1h' });

        res.status(200).json({ message: 'Đăng nhập thành công!', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra khi đăng nhập.' });
    }
});

// API để lấy danh sách người dùng cho Admin
app.get('/api/admin/users', async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Không có quyền truy cập.' });
    }

    try {
        // Xác thực token
        const decoded = jwt.verify(token, 'secretKey');

        // Kiểm tra role của người dùng (chỉ cho phép admin truy cập)
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập trang admin.' });
        }

        // Lấy tất cả người dùng
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách người dùng.' });
    }
});
// Xóa người dùng
app.delete('/api/admin/delete-user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cập nhật mật khẩu người dùng
app.put('/api/admin/update-password/:id', async (req, res) => {
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})