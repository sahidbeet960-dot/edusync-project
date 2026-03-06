import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_colors.dart';

class GradientButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final LinearGradient? gradient;
  final double? width;
  final double height;
  final IconData? icon;

  const GradientButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.gradient,
    this.width,
    this.height = 56,
    this.icon,
  });

  @override
  State<GradientButton> createState() => _GradientButtonState();
}

class _GradientButtonState extends State<GradientButton> with SingleTickerProviderStateMixin {
  bool _isHovered = false;
  bool _isPressed = false;
  late AnimationController _shimmerController;

  @override
  void initState() {
    super.initState();
    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();
  }

  @override
  void dispose() {
    _shimmerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDisabled = widget.onPressed == null || widget.isLoading;

    return GestureDetector(
      onTapDown: (_) {
        if (!isDisabled) {
          setState(() => _isPressed = true);
        }
      },
      onTapUp: (_) {
        if (!isDisabled) {
          setState(() => _isPressed = false);
          HapticFeedback.mediumImpact();
          widget.onPressed!();
        }
      },
      onTapCancel: () {
        if (!isDisabled) {
          setState(() => _isPressed = false);
        }
      },
      child: MouseRegion(
        onEnter: (_) => {if (!isDisabled) setState(() => _isHovered = true)},
        onExit: (_) => {if (!isDisabled) setState(() => _isHovered = false)},
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOutCubic,
          width: widget.width ?? double.infinity,
          height: widget.height,
          transform: Matrix4.identity()..scale(_isPressed ? 0.95 : (_isHovered ? 1.02 : 1.0)),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: isDisabled
                ? LinearGradient(colors: [Colors.white.withValues(alpha: 0.1), Colors.white.withValues(alpha: 0.05)])
                : (widget.gradient ?? AppColors.primaryGradient),
            boxShadow: [
              if (!isDisabled)
                BoxShadow(
                  color: (widget.gradient?.colors.first ?? AppColors.primary).withValues(alpha: _isHovered ? 0.4 : 0.25),
                  blurRadius: _isHovered ? 24 : 16,
                  spreadRadius: _isHovered ? 2 : 0,
                  offset: Offset(0, _isHovered ? 8 : 6),
                ),
            ],
            border: Border.all(
              color: Colors.white.withValues(alpha: _isHovered ? 0.4 : 0.15),
              width: 1.5,
            ),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Shimmer overlay layout
                if (!isDisabled)
                  AnimatedBuilder(
                    animation: _shimmerController,
                    builder: (context, child) {
                      return Positioned(
                        left: -widget.height * 2 + (_shimmerController.value * (MediaQuery.of(context).size.width) * 2),
                        top: -widget.height,
                        bottom: -widget.height,
                        width: widget.height,
                        child: Transform.rotate(
                          angle: 0.3,
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.white.withValues(alpha: 0.0),
                                  Colors.white.withValues(alpha: 0.3),
                                  Colors.white.withValues(alpha: 0.0),
                                ],
                                begin: Alignment.centerLeft,
                                end: Alignment.centerRight,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                  
                // Main Content
                widget.isLoading
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (widget.icon != null) ...[
                            Icon(widget.icon, color: Colors.white, size: 22),
                            const SizedBox(width: 10),
                          ],
                          Text(
                            widget.text,
                            style: TextStyle(
                              color: isDisabled ? Colors.white.withValues(alpha: 0.5) : Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
