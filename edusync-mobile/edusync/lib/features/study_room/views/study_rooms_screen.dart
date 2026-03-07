import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';
import 'package:lottie/lottie.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../../../core/widgets/glass_card.dart';
import '../viewmodels/study_room_viewmodel.dart';
import '../../auth/viewmodels/auth_viewmodel.dart';

class PulseAnimation extends StatefulWidget {
  final Widget child;
  const PulseAnimation({super.key, required this.child});
  @override
  State<PulseAnimation> createState() => _PulseAnimationState();
}

class _PulseAnimationState extends State<PulseAnimation> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutExpo),
    );
    _fadeAnimation = Tween<double>(begin: 0.4, end: 0.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutExpo),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        AnimatedBuilder(
          animation: _animController,
          builder: (context, _) {
            return Transform.scale(
              scale: _scaleAnimation.value,
              child: Opacity(
                opacity: _fadeAnimation.value,
                child: Container(
                  width: double.infinity,
                  height: 56, // Fixed height from gradient_button
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.primary, width: 3),
                  ),
                ),
              ),
            );
          },
        ),
        widget.child,
      ],
    );
  }
}

class StudyRoomsScreen extends StatefulWidget {
  const StudyRoomsScreen({super.key});

  @override
  State<StudyRoomsScreen> createState() => _StudyRoomsScreenState();
}

class _StudyRoomsScreenState extends State<StudyRoomsScreen> {
  final _roomNameController = TextEditingController();

  @override
  void dispose() {
    _roomNameController.dispose();
    super.dispose();
  }

  void _joinRoom(String roomId) {
    final authVM = context.read<AuthViewModel>();
    final roomVM = context.read<StudyRoomViewModel>();
    HapticFeedback.mediumImpact();

    final user = authVM.user;
    if (user == null || user.id == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error: Please log in again to sync your profile.')),
      );
      return;
    }

    // Safely parse the user ID from String to int
    final userId = int.tryParse(user.id.toString()) ?? 0;

    roomVM.joinRoom(
      roomId.replaceAll(' ', '-').toLowerCase(),
      user.fullName ?? 'Anonymous',
      userId,
    );
  }

  Widget _buildTrendingRooms() {
    final trending = [
      {'name': 'comp-sci-101', 'users': 14},
      {'name': 'math-302-midterm', 'users': 8},
      {'name': 'design-systems', 'users': 5},
      {'name': 'chem-lab-prep', 'users': 3},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Text(
            'TRENDING NOW',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.textSecondaryDark,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.0,
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 80,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: trending.length,
            itemBuilder: (context, i) {
              final roomName = trending[i]['name'] as String;
              final usersCount = trending[i]['users'] as int;
              return GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  _roomNameController.text = roomName;
                },
                child: Container(
                  width: 200,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.03),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.tag_rounded, color: AppColors.primaryLight, size: 16),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              roomName,
                              style: const TextStyle(
                                color: AppColors.textPrimaryDark,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: AppColors.success,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(color: AppColors.success.withValues(alpha: 0.5), blurRadius: 4, spreadRadius: 1),
                              ],
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '$usersCount active users',
                            style: TextStyle(
                              color: AppColors.textSecondaryDark.withValues(alpha: 0.8),
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final roomVM = context.watch<StudyRoomViewModel>();

    return GradientScaffold(
      body: SafeArea(
        child: Column(
          children: [
            // --- Header ---
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.headphones_rounded, color: AppColors.primaryLight, size: 24),
                  ),
                  const SizedBox(width: 16),
                  Text(
                    'Study Rooms',
                    style: AppTextStyles.headlineMedium.copyWith(
                      color: AppColors.textPrimaryDark,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const Spacer(),
                  if (roomVM.isConnected)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.success.withValues(alpha: 0.4)),
                        boxShadow: [
                           BoxShadow(
                             color: AppColors.success.withValues(alpha: 0.1),
                             blurRadius: 8,
                           ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 8, height: 8,
                            decoration: BoxDecoration(
                              color: AppColors.success,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(color: AppColors.success.withValues(alpha: 0.6), blurRadius: 4, spreadRadius: 1),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'LIVE',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.success,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            if (!roomVM.isConnected) ...[
              // --- JOIN ROOM UI ---
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Center(
                          child: GlassCard(
                            padding: const EdgeInsets.all(32),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    gradient: AppColors.primaryGradient,
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppColors.primary.withValues(alpha: 0.4),
                                        blurRadius: 24,
                                        offset: const Offset(0, 10),
                                      ),
                                    ],
                                  ),
                                  child: const Icon(
                                    Icons.meeting_room_rounded,
                                    size: 40,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 24),
                                Text(
                                  'Join a Focus Session',
                                  style: AppTextStyles.headlineSmall.copyWith(
                                    color: AppColors.textPrimaryDark,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Enter a room ID to study alongside your peers in real-time.',
                                  textAlign: TextAlign.center,
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    color: AppColors.textSecondaryDark,
                                  ),
                                ),
                                const SizedBox(height: 32),
                                CustomTextField(
                                  controller: _roomNameController,
                                  label: 'ROOM ID',
                                  hint: 'e.g. comp-sci-101',
                                  prefixIcon: Icons.tag_rounded,
                                ),
                                const SizedBox(height: 24),
                                PulseAnimation(
                                  child: GradientButton(
                                    text: 'Join Session',
                                    icon: Icons.login_rounded,
                                    onPressed: () {
                                      final text = _roomNameController.text.trim();
                                      if (text.isNotEmpty) {
                                        _joinRoom(text);
                                        FocusScope.of(context).unfocus();
                                      } else {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(content: Text('Please enter a room ID')),
                                        );
                                      }
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      _buildTrendingRooms(),
                      const SizedBox(height: 120),
                    ],
                  ),
                ),
              ),
            ] else ...[
              // --- ACTIVE FOCUS ROOM UI ---
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.02),
                  border: Border(bottom: BorderSide(color: Colors.white.withValues(alpha: 0.1))),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                         gradient: AppColors.primaryGradient,
                         borderRadius: BorderRadius.circular(12),
                         boxShadow: [
                           BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 4))
                         ],
                      ),
                      child: const Icon(Icons.tag_rounded, color: Colors.white, size: 20),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        roomVM.currentRoomId ?? 'room',
                        style: AppTextStyles.titleLarge.copyWith(color: AppColors.textPrimaryDark, fontWeight: FontWeight.w800),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    TextButton.icon(
                      onPressed: () {
                         HapticFeedback.lightImpact();
                         roomVM.leaveRoom();
                      },
                      icon: const Icon(Icons.sensor_door_rounded, color: AppColors.error, size: 20),
                      label: const Text('Leave', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
                      style: TextButton.styleFrom(
                        backgroundColor: AppColors.error.withValues(alpha: 0.1),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ],
                ),
              ),

              // Participant Grid 
              Expanded(
                child: GridView.builder(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(24, 24, 24, 120),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 0.85,
                  ),
                  itemCount: roomVM.participants.length + 1,
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      return _buildParticipantCard(
                        name: roomVM.myUsername ?? 'Me',
                        activeTime: roomVM.myActiveTime,
                        isMe: true,
                      );
                    }
                    
                    final peer = roomVM.participants[index - 1];
                    return _buildParticipantCard(
                      name: peer.username,
                      activeTime: peer.activeTime,
                      isMe: false,
                    );
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildParticipantCard({required String name, required String activeTime, required bool isMe}) {
    final words = name.split(' ').where((w) => w.isNotEmpty).toList();
    final initials = words.isNotEmpty ? words.take(2).map((w) => w[0].toUpperCase()).join() : '?';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isMe ? AppColors.primary.withValues(alpha: 0.5) : Colors.white.withValues(alpha: 0.08),
          width: isMe ? 2 : 1.5,
        ),
        boxShadow: [
          if (isMe)
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.2),
              blurRadius: 20,
              spreadRadius: -5,
              offset: const Offset(0, 10),
            )
          else
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 80,
                height: 80,
                child: Lottie.asset(
                  'assets/animations/Studying.json',
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  isMe ? '$name (You)' : name,
                  style: AppTextStyles.titleMedium.copyWith(color: AppColors.textPrimaryDark, fontSize: 13, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.timer_outlined, 
                      color: isMe ? AppColors.primaryLight : AppColors.textSecondaryDark, 
                      size: 14
                    ),
                    const SizedBox(width: 6),
                    Text(
                      activeTime,
                      style: TextStyle(
                        color: isMe ? AppColors.primaryLight : AppColors.textSecondaryDark,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        fontFeatures: const [FontFeature.tabularFigures()],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}