# 📋 Danh sách chức năng cần thêm vào dự án Moji-N10

## ✅ Chức năng hiện có
- ✅ Đăng nhập / Đăng ký / Đăng xuất
- ✅ Tìm kiếm người dùng
- ✅ Gửi/Chấp nhận/Từ chối lời mời kết bạn
- ✅ Xem danh sách bạn bè
- ✅ Chat 1-1 (text, ảnh, video)
- ✅ Real-time messaging với Socket.io
- ✅ Upload files (ảnh, video)
- ✅ Đánh dấu tin nhắn đã đọc
- ✅ Unread message count

---

## 🔥 Ưu tiên cao (Chức năng cơ bản còn thiếu)

### 1. **User Profile Management** 👤
- [ ] Trang Profile để xem thông tin cá nhân
- [ ] Chỉnh sửa thông tin (tên, email)
- [ ] Upload/Thay đổi avatar
- [ ] Xem profile của người khác
- [ ] **Lý do**: Cần thiết cho mọi ứng dụng social

### 2. **Online/Offline Status** 🟢
- [ ] Hiển thị trạng thái online/offline real-time
- [ ] Last seen timestamp
- [ ] Status indicator trong friend list
- [ ] **Lý do**: Cải thiện UX, biết ai đang online

### 3. **Typing Indicators** ⌨️
- [ ] Hiển thị "đang gõ..." khi người khác đang nhập
- [ ] Socket event cho typing status
- [ ] **Lý do**: Trải nghiệm chat hiện đại

### 4. **Delete Messages** 🗑️
- [ ] Xóa tin nhắn của mình
- [ ] Xóa cho cả hai bên (nếu cần)
- [ ] Undo delete (tùy chọn)
- [ ] **Lý do**: Chức năng cơ bản của chat

### 5. **Unfriend** 👋
- [ ] Hủy kết bạn
- [ ] Xác nhận trước khi hủy
- [ ] **Lý do**: Quản lý danh sách bạn bè

### 6. **Settings Page** ⚙️
- [ ] Trang cài đặt
- [ ] Đổi mật khẩu
- [ ] Cài đặt thông báo
- [ ] Theme settings (light/dark mode)
- [ ] **Lý do**: Quản lý tài khoản

---

## 🎯 Ưu tiên trung bình (Cải thiện trải nghiệm)

### 7. **Message Reactions** ❤️
- [ ] Like/React tin nhắn (❤️, 👍, 😂, etc.)
- [ ] Hiển thị số lượng reactions
- [ ] Xem ai đã react
- [ ] **Lý do**: Tương tác phong phú hơn

### 8. **Edit Messages** ✏️
- [ ] Sửa tin nhắn đã gửi
- [ ] Hiển thị "đã chỉnh sửa"
- [ ] Lịch sử chỉnh sửa (tùy chọn)
- [ ] **Lý do**: Sửa lỗi chính tả, cập nhật thông tin

### 9. **Message Search** 🔍
- [ ] Tìm kiếm tin nhắn trong cuộc trò chuyện
- [ ] Tìm kiếm toàn cục
- [ ] Filter theo ngày, người gửi
- [ ] **Lý do**: Tìm lại tin nhắn cũ

### 10. **File Management** 📎
- [ ] Download files
- [ ] Preview files tốt hơn
- [ ] File size limits
- [ ] File type restrictions
- [ ] **Lý do**: Quản lý files tốt hơn

### 11. **Emoji Picker** 😊
- [ ] Emoji picker trong input
- [ ] Emoji suggestions
- [ ] Recent emojis
- [ ] **Lý do**: Chat vui vẻ hơn

### 12. **Message Forwarding** ➡️
- [ ] Chuyển tiếp tin nhắn
- [ ] Forward đến nhiều người
- [ ] **Lý do**: Chia sẻ tin nhắn

### 13. **Block/Unblock Users** 🚫
- [ ] Chặn người dùng
- [ ] Không nhận tin nhắn từ người bị chặn
- [ ] Danh sách người bị chặn
- [ ] **Lý do**: Bảo vệ người dùng

### 14. **Dark Mode** 🌙
- [ ] Dark theme
- [ ] Toggle light/dark mode
- [ ] Lưu preference
- [ ] **Lý do**: Trải nghiệm tốt hơn vào ban đêm

### 15. **Notifications** 🔔
- [ ] Browser notifications
- [ ] Sound notifications (đã có)
- [ ] Notification settings
- [ ] Desktop notifications
- [ ] **Lý do**: Không bỏ lỡ tin nhắn

---

## 🚀 Ưu tiên thấp (Tính năng nâng cao)

### 16. **Group Chat** 👥
- [ ] Tạo nhóm chat
- [ ] Thêm/xóa thành viên
- [ ] Quản lý nhóm (admin)
- [ ] Group settings
- [ ] **Lý do**: Chat với nhiều người

### 17. **Voice/Video Messages** 🎤
- [ ] Gửi voice message
- [ ] Gửi video message
- [ ] Record audio/video
- [ ] **Lý do**: Giao tiếp phong phú hơn

### 18. **Voice/Video Call** 📞
- [ ] Voice call
- [ ] Video call
- [ ] WebRTC integration
- [ ] Call history
- [ ] **Lý do**: Gọi trực tiếp

### 19. **Message Pinning** 📌
- [ ] Ghim tin nhắn quan trọng
- [ ] Xem tin nhắn đã ghim
- [ ] **Lý do**: Tìm tin nhắn quan trọng nhanh

### 20. **Read Receipts** ✅
- [ ] Hiển thị "đã xem" (đã có isRead)
- [ ] Timestamp khi xem
- [ ] **Lý do**: Biết người khác đã đọc chưa

### 21. **Message History Export** 📥
- [ ] Export chat history
- [ ] Download as PDF/TXT
- [ ] **Lý do**: Backup tin nhắn

### 22. **Stickers/GIFs** 🎨
- [ ] Sticker pack
- [ ] GIF search (Giphy integration)
- [ ] **Lý do**: Chat vui vẻ hơn

### 23. **Message Scheduling** ⏰
- [ ] Lên lịch gửi tin nhắn
- [ ] **Lý do**: Gửi tin nhắn đúng giờ

### 24. **Chat Backup** 💾
- [ ] Tự động backup
- [ ] Restore từ backup
- [ ] **Lý do**: Bảo vệ dữ liệu

### 25. **Advanced Search** 🔎
- [ ] Tìm kiếm nâng cao
- [ ] Filter phức tạp
- [ ] **Lý do**: Tìm kiếm hiệu quả hơn

---

## 📱 Mobile & Responsive

### 26. **PWA Support** 📲
- [ ] Progressive Web App
- [ ] Install as app
- [ ] Offline support
- [ ] **Lý do**: Dùng như app mobile

### 27. **Mobile Optimizations** 📱
- [ ] Touch gestures
- [ ] Swipe actions
- [ ] Better mobile UI
- [ ] **Lý do**: Trải nghiệm mobile tốt hơn

---

## 🔒 Security & Privacy

### 28. **Two-Factor Authentication** 🔐
- [ ] 2FA với SMS/Email
- [ ] Authenticator app support
- [ ] **Lý do**: Bảo mật tốt hơn

### 29. **End-to-End Encryption** 🔒
- [ ] E2E encryption cho messages
- [ ] **Lý do**: Bảo mật cao

### 30. **Privacy Settings** 🛡️
- [ ] Ai có thể tìm thấy bạn
- [ ] Ai có thể gửi lời mời
- [ ] **Lý do**: Kiểm soát quyền riêng tư

---

## 📊 Analytics & Admin

### 31. **Admin Panel** 👨‍💼
- [ ] Admin dashboard
- [ ] User management
- [ ] System statistics
- [ ] **Lý do**: Quản lý hệ thống

### 32. **User Analytics** 📈
- [ ] Thống kê tin nhắn
- [ ] Activity tracking
- [ ] **Lý do**: Hiểu hành vi người dùng

---

## 🎨 UI/UX Improvements

### 33. **Loading States** ⏳
- [ ] Skeleton screens
- [ ] Better loading indicators
- [ ] **Lý do**: Perceived performance

### 34. **Error Handling** ⚠️
- [ ] Better error messages
- [ ] Retry mechanisms
- [ ] **Lý do**: UX tốt hơn khi lỗi

### 35. **Accessibility** ♿
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] **Lý do**: Accessible cho mọi người

---

## 🎯 Gợi ý triển khai theo thứ tự

### Phase 1 (Quan trọng nhất - 1-2 tuần)
1. User Profile Management
2. Online/Offline Status
3. Typing Indicators
4. Delete Messages
5. Unfriend
6. Settings Page

### Phase 2 (Cải thiện UX - 2-3 tuần)
7. Message Reactions
8. Edit Messages
9. Message Search
10. Emoji Picker
11. Dark Mode
12. Notifications

### Phase 3 (Tính năng nâng cao - 3-4 tuần)
13. Group Chat
14. Voice/Video Messages
15. Block/Unblock
16. Message Forwarding
17. File Management improvements

### Phase 4 (Tùy chọn - sau này)
18. Voice/Video Call
19. PWA Support
20. 2FA
21. Admin Panel

---

## 💡 Lưu ý

- **Bắt đầu với Phase 1** vì đây là các chức năng cơ bản nhất
- **Test kỹ** mỗi tính năng trước khi chuyển sang tính năng tiếp theo
- **Ưu tiên UX** - đảm bảo mọi tính năng đều dễ sử dụng
- **Performance** - tối ưu hóa cho tốc độ và hiệu suất
- **Security** - đảm bảo bảo mật cho mọi tính năng

---

## 📝 Notes

- Model User đã có field `avatar` nhưng chưa có UI để upload
- Model Message đã có `isRead` nhưng có thể cải thiện read receipts
- Socket.io đã được setup, có thể mở rộng cho typing indicators, online status
- Upload service đã có, có thể mở rộng cho avatar upload

