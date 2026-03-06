import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lottie/lottie.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/validators.dart';
import '../viewmodels/auth_viewmodel.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _loginFormKey = GlobalKey<FormState>();
  final _registerFormKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  final _departmentController = TextEditingController();
  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  bool _isRegisterMode = false;
  bool _obscurePassword = true;
  int _selectedSemester = 1;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _nameController.dispose();
    _departmentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      body: Stack(
        children: [
          // ─── Background Gradient Orbs ───
          Positioned(
            top: -size.height * 0.08,
            left: -size.width * 0.15,
            child: Container(
              width: size.width * 0.7,
              height: size.width * 0.7,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF1A8C8C).withValues(alpha: 0.5),
                    const Color(0xFF1A8C8C).withValues(alpha: 0.0),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -size.height * 0.1,
            right: -size.width * 0.2,
            child: Container(
              width: size.width * 0.65,
              height: size.width * 0.65,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF7C3AED).withValues(alpha: 0.4),
                    const Color(0xFF7C3AED).withValues(alpha: 0.0),
                  ],
                ),
              ),
            ),
          ),

          // ─── Main Content ───
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 400),
                    switchInCurve: Curves.easeOutExpo,
                    switchOutCurve: Curves.easeIn,
                    child: _isRegisterMode
                        ? _buildRegisterView(key: const ValueKey('register'))
                        : _buildLoginView(key: const ValueKey('login')),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // ─── LOGIN VIEW ───
  // ═══════════════════════════════════════════════════════

  Widget _buildLoginView({Key? key}) {
    return Column(
      key: key,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Illustration
        Lottie.asset(
          'assets/animations/login_animation.json',
          width: 200,
          height: 180,
          fit: BoxFit.contain,
        ),
        const SizedBox(height: 20),

        // App Name
        ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [Color(0xFF00D4FF), Color(0xFF7C3AED)],
          ).createShader(bounds),
          child: Text(
            'EduSync',
            style: AppTextStyles.headlineLarge.copyWith(
              fontSize: 36,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -1.0,
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Your Smart Campus Hub.',
          style: AppTextStyles.bodyMedium.copyWith(
            color: Colors.white.withValues(alpha: 0.5),
            fontSize: 15,
            letterSpacing: 0.5,
          ),
        ),

        const SizedBox(height: 36),

        // Form
        Consumer<AuthViewModel>(
          builder: (context, auth, _) => Form(
            key: _loginFormKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildInputField(
                  controller: _emailController,
                  hint: 'Email Address',
                  icon: Icons.mail_outline_rounded,
                  keyboardType: TextInputType.emailAddress,
                  validator: Validators.email,
                ),
                const SizedBox(height: 16),
                _buildInputField(
                  controller: _passwordController,
                  hint: 'Password',
                  icon: Icons.lock_outline_rounded,
                  obscureText: _obscurePassword,
                  validator: Validators.password,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                      color: Colors.white.withValues(alpha: 0.4),
                      size: 20,
                    ),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),

                if (auth.error != null) ...[
                  const SizedBox(height: 16),
                  _buildErrorBanner(auth.error!),
                ],

                const SizedBox(height: 28),

                // Login Button
                _buildGradientButton(
                  text: 'Login',
                  isLoading: auth.isLoading,
                  onPressed: () {
                    HapticFeedback.mediumImpact();
                    _submitLogin(auth);
                  },
                ),

                const SizedBox(height: 24),

                // Switch to Register
                Center(
                  child: GestureDetector(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      setState(() {
                        _isRegisterMode = true;
                        auth.clearError();
                        _loginFormKey.currentState?.reset();
                      });
                    },
                    child: RichText(
                      text: TextSpan(
                        style: const TextStyle(fontSize: 14),
                        children: [
                          TextSpan(
                            text: 'New here? ',
                            style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontWeight: FontWeight.w500),
                          ),
                          const TextSpan(
                            text: 'Create Account',
                            style: TextStyle(
                              color: Color(0xFF00D4FF),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════
  // ─── REGISTER VIEW ───
  // ═══════════════════════════════════════════════════════

  Widget _buildRegisterView({Key? key}) {
    return Column(
      key: key,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Illustration
        Lottie.asset(
          'assets/animations/register_animation.json',
          width: 200,
          height: 180,
          fit: BoxFit.contain,
        ),
        const SizedBox(height: 20),

        // Title
        Text(
          'Create Account',
          style: AppTextStyles.headlineLarge.copyWith(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Join EduSync — Your academic journey starts here',
          style: AppTextStyles.bodyMedium.copyWith(
            color: Colors.white.withValues(alpha: 0.45),
            fontSize: 14,
          ),
          textAlign: TextAlign.center,
        ),

        const SizedBox(height: 32),

        // Form
        Consumer<AuthViewModel>(
          builder: (context, auth, _) => Form(
            key: _registerFormKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildInputField(
                  controller: _nameController,
                  hint: 'Full name',
                  icon: Icons.person_outline_rounded,
                  validator: (v) => Validators.required(v, 'Name'),
                ),
                const SizedBox(height: 14),
                _buildInputField(
                  controller: _emailController,
                  hint: 'Email address',
                  icon: Icons.mail_outline_rounded,
                  keyboardType: TextInputType.emailAddress,
                  validator: Validators.email,
                ),
                const SizedBox(height: 14),
                _buildInputField(
                  controller: _passwordController,
                  hint: 'Password',
                  icon: Icons.lock_outline_rounded,
                  obscureText: _obscurePassword,
                  validator: Validators.password,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                      color: Colors.white.withValues(alpha: 0.4),
                      size: 20,
                    ),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                ),
                const SizedBox(height: 14),
                _buildInputField(
                  controller: _departmentController,
                  hint: 'Department (e.g. Computer Science)',
                  icon: Icons.domain_rounded,
                ),
                const SizedBox(height: 14),
                // Semester Dropdown
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.04),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1), width: 1.5),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today_rounded, color: Color(0xFF00D4FF), size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<int>(
                          initialValue: _selectedSemester,
                          dropdownColor: const Color(0xFF1A1F38),
                          style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w500),
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(vertical: 14),
                          ),
                          icon: Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white.withValues(alpha: 0.4)),
                          items: List.generate(8, (i) => DropdownMenuItem(
                            value: i + 1,
                            child: Text('Semester ${i + 1}'),
                          )),
                          onChanged: (v) => setState(() => _selectedSemester = v ?? 1),
                        ),
                      ),
                    ],
                  ),
                ),

                if (auth.error != null) ...[
                  const SizedBox(height: 16),
                  _buildErrorBanner(auth.error!),
                ],

                const SizedBox(height: 28),

                // Register Button
                _buildGradientButton(
                  text: 'Create Account',
                  isLoading: auth.isLoading,
                  onPressed: () {
                    HapticFeedback.mediumImpact();
                    _submitRegister(auth);
                  },
                ),

                const SizedBox(height: 24),

                // Switch to Login
                Center(
                  child: GestureDetector(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      setState(() {
                        _isRegisterMode = false;
                        auth.clearError();
                        _registerFormKey.currentState?.reset();
                      });
                    },
                    child: RichText(
                      text: TextSpan(
                        style: const TextStyle(fontSize: 14),
                        children: [
                          TextSpan(
                            text: 'Already have an account? ',
                            style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontWeight: FontWeight.w500),
                          ),
                          const TextSpan(
                            text: 'Sign In',
                            style: TextStyle(
                              color: Color(0xFF00D4FF),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════
  // ─── SHARED WIDGETS ───
  // ═══════════════════════════════════════════════════════

  Widget _buildInputField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    bool obscureText = false,
    String? Function(String?)? validator,
    Widget? suffixIcon,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      obscureText: obscureText,
      validator: validator,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 15,
        fontWeight: FontWeight.w500,
      ),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(
          color: Colors.white.withValues(alpha: 0.35),
          fontSize: 15,
          fontWeight: FontWeight.w400,
        ),
        prefixIcon: Padding(
          padding: const EdgeInsets.only(left: 16, right: 12),
          child: Icon(icon, color: const Color(0xFF00D4FF), size: 20),
        ),
        prefixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.04),
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1), width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF00D4FF), width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.error, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColors.error, width: 1.5),
        ),
        errorStyle: const TextStyle(color: AppColors.error, fontSize: 11),
      ),
    );
  }

  Widget _buildGradientButton({
    required String text,
    required bool isLoading,
    required VoidCallback onPressed,
  }) {
    return GestureDetector(
      onTap: isLoading ? null : onPressed,
      child: Container(
        height: 56,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: const LinearGradient(
            colors: [Color(0xFF00D4FF), Color(0xFF0090FF)],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF00D4FF).withValues(alpha: 0.3),
              blurRadius: 20,
              spreadRadius: 0,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Center(
          child: isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: Colors.white,
                  ),
                )
              : Text(
                  text,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                ),
        ),
      ),
    );
  }

  Widget _buildErrorBanner(String message) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.error.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: AppColors.error,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════
  // ─── SUBMIT LOGIC ───
  // ═══════════════════════════════════════════════════════

  void _submitLogin(AuthViewModel auth) {
    if (!_loginFormKey.currentState!.validate()) return;
    auth.login(
      _emailController.text.trim(),
      _passwordController.text,
    );
  }

  void _submitRegister(AuthViewModel auth) {
    if (!_registerFormKey.currentState!.validate()) return;
    auth.register(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      fullName: _nameController.text.trim(),
      role: 'STUDENT',
      department: _departmentController.text.trim(),
      semester: _selectedSemester,
    );
  }
}
