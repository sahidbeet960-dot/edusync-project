import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/glass_card.dart';
import '../../../core/widgets/gradient_button.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../core/widgets/gradient_scaffold.dart';
import '../../../data/models/academic_event_model.dart';
import '../../auth/viewmodels/auth_viewmodel.dart';
import '../viewmodels/calendar_viewmodel.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CalendarViewModel>().loadEvents();
    });
  }

  @override
  Widget build(BuildContext context) {
    final calVM = context.watch<CalendarViewModel>();
    final authVM = context.watch<AuthViewModel>();

    return GradientScaffold(
      floatingActionButton: authVM.user?.canCreateEvents == true
          ? Padding(
              padding: const EdgeInsets.only(bottom: 90),
              child: Container(
                decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(color: AppColors.primary.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 8)),
                ],
                gradient: AppColors.primaryGradient,
              ),
              child: FloatingActionButton.extended(
                onPressed: () {
                  HapticFeedback.mediumImpact();
                  _showCreateEventSheet(context);
                },
                icon: const Icon(Icons.add_rounded, color: Colors.white),
                label: const Text('Add Event', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                backgroundColor: Colors.transparent,
                elevation: 0,
                focusElevation: 0,
                hoverElevation: 0,
              ),
            ))
          : null,
      body: SafeArea(
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            SliverAppBar(
              floating: true,
              backgroundColor: Colors.transparent,
              title: Padding(
                padding: const EdgeInsets.only(left: 8.0),
                child: Text(
                  'Calendar',
                  style: AppTextStyles.headlineMedium.copyWith(
                    color: AppColors.textPrimaryDark,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.refresh_rounded),
                  color: AppColors.textSecondaryDark,
                  onPressed: () {
                    HapticFeedback.lightImpact();
                    calVM.loadEvents(forceRefresh: true);
                  },
                ),
                const SizedBox(width: 8),
              ],
            ),

            // Month selector
            SliverToBoxAdapter(
              child: _buildMonthSelector(calVM),
            ),

            // Mini calendar grid
            SliverToBoxAdapter(
              child: _buildCalendarGrid(calVM),
            ),

            // Event list header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
                child: Row(
                  children: [
                    Text(
                      'Events for ${DateFormat('MMM d').format(calVM.selectedDate)}',
                      style: AppTextStyles.titleLarge.copyWith(
                        color: AppColors.textPrimaryDark,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        '${calVM.eventsForSelectedDate.length}',
                        style: const TextStyle(
                          color: AppColors.primaryLight,
                          fontWeight: FontWeight.w800,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Events
            if (calVM.isLoading)
              const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(
                    color: AppColors.primaryLight,
                  ),
                ),
              )
            else if (calVM.eventsForSelectedDate.isEmpty)
              SliverFillRemaining(
                child: EmptyState(
                  icon: Icons.event_busy_rounded,
                  title: 'No events on this day',
                  subtitle: 'Select another date or create an event',
                  lottieAsset: 'assets/animations/empty_list.json',
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 120),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (_, i) => _buildEventCard(calVM.eventsForSelectedDate[i]),
                    childCount: calVM.eventsForSelectedDate.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMonthSelector(CalendarViewModel calVM) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            IconButton(
              icon: const Icon(Icons.chevron_left_rounded,
                  color: AppColors.textPrimaryDark),
              onPressed: () {
                HapticFeedback.lightImpact();
                calVM.selectDate(DateTime(
                  calVM.selectedDate.year,
                  calVM.selectedDate.month - 1,
                  1,
                ));
              },
            ),
            // We can add AnimatedSwitcher for slide transitions over month
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              transitionBuilder: (child, animation) => FadeTransition(opacity: animation, child: child),
              child: Text(
                DateFormat('MMMM yyyy').format(calVM.selectedDate),
                key: ValueKey(calVM.selectedDate.month),
                style: AppTextStyles.titleLarge.copyWith(
                  color: AppColors.textPrimaryDark,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right_rounded,
                  color: AppColors.textPrimaryDark),
              onPressed: () {
                HapticFeedback.lightImpact();
                calVM.selectDate(DateTime(
                  calVM.selectedDate.year,
                  calVM.selectedDate.month + 1,
                  1,
                ));
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCalendarGrid(CalendarViewModel calVM) {
    final firstDay = DateTime(
      calVM.selectedDate.year,
      calVM.selectedDate.month,
      1,
    );
    final daysInMonth = DateTime(
      calVM.selectedDate.year,
      calVM.selectedDate.month + 1,
      0,
    ).day;
    final startWeekday = firstDay.weekday % 7;
    final today = DateTime.now();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          // Weekday headers
          Row(
            children: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                .map(
                  (d) => Expanded(
                    child: Center(
                      child: Text(
                        d,
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.textSecondaryDark,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 12),
          // Days grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              childAspectRatio: 0.9, // Taller cells for indicator bars
            ),
            itemCount: startWeekday + daysInMonth,
            itemBuilder: (context, index) {
              if (index < startWeekday) return const SizedBox();
              final day = index - startWeekday + 1;
              final date = DateTime(
                calVM.selectedDate.year,
                calVM.selectedDate.month,
                day,
              );
              final isSelected = day == calVM.selectedDate.day;
              final isToday = date.year == today.year &&
                  date.month == today.month &&
                  date.day == today.day;
              final hasEvents = calVM.events.any((e) =>
                  e.eventDate.year == date.year &&
                  e.eventDate.month == date.month &&
                  e.eventDate.day == date.day);

              return GestureDetector(
                onTap: () {
                  HapticFeedback.selectionClick();
                  calVM.selectDate(date);
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeOutCubic,
                  margin: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    gradient: isSelected
                        ? AppColors.primaryGradient
                        : isToday
                            ? LinearGradient(colors: [Colors.white.withValues(alpha: 0.1), Colors.white.withValues(alpha: 0.05)])
                            : null,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? Colors.transparent : (isToday ? Colors.white.withValues(alpha: 0.2) : Colors.transparent),
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.5),
                              blurRadius: 16,
                              spreadRadius: -2,
                              offset: const Offset(0, 4),
                            )
                          ]
                        : [],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '$day',
                        style: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : (isToday ? AppColors.primaryLight : AppColors.textPrimaryDark),
                          fontWeight: (isToday || isSelected)
                              ? FontWeight.w800
                              : FontWeight.w500,
                          fontSize: 14,
                        ),
                      ),
                      if (hasEvents)
                        Container(
                          margin: const EdgeInsets.only(top: 4),
                          width: 16,
                          height: 3,
                          decoration: BoxDecoration(
                            color: isSelected
                                ? Colors.white
                                : AppColors.secondary,
                            borderRadius: BorderRadius.circular(2),
                            boxShadow: [
                              if (!isSelected)
                                BoxShadow(color: AppColors.secondary.withValues(alpha: 0.5), blurRadius: 4),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEventCard(AcademicEventModel event) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () {
            HapticFeedback.lightImpact();
            // Handle event detail internally if logic existed
          },
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.accent1.withValues(alpha: 0.2), AppColors.accent2.withValues(alpha: 0.2)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.accent2.withValues(alpha: 0.3)),
                  ),
                  child: const Icon(Icons.event_note_rounded,
                      color: AppColors.accent2, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        event.title,
                        style: AppTextStyles.titleMedium.copyWith(
                          color: AppColors.textPrimaryDark,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (event.description != null) ...[
                        const SizedBox(height: 6),
                        Text(
                          event.description!,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.textSecondaryDark,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.access_time_rounded,
                                    size: 12, color: AppColors.textSecondaryDark.withValues(alpha: 0.8)),
                                const SizedBox(width: 4),
                                Text(
                                  DateFormat('h:mm a').format(event.eventDate),
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.textSecondaryDark,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (event.location != null) ...[
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                '@ ${event.location!}',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.primaryLight,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showCreateEventSheet(BuildContext context) {
    final titleCtl = TextEditingController();
    final descCtl = TextEditingController();
    final locationCtl = TextEditingController();
    DateTime selectedDate = DateTime.now();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceDark,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.fromLTRB(
            24,
            24,
            24,
            MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 48,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.edit_calendar_rounded,
                        color: AppColors.primaryLight, size: 20),
                  ),
                  const SizedBox(width: 16),
                  Text(
                    'Create Event',
                    style: AppTextStyles.headlineSmall.copyWith(
                      color: AppColors.textPrimaryDark,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              CustomTextField(
                controller: titleCtl,
                label: 'TITLE',
                hint: 'Event title',
                prefixIcon: Icons.title_rounded,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: descCtl,
                label: 'DESCRIPTION',
                hint: 'Optional description',
                prefixIcon: Icons.notes_rounded,
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: locationCtl,
                label: 'LOCATION / LINK',
                hint: 'Optional location',
                prefixIcon: Icons.location_on_rounded,
              ),
              const SizedBox(height: 24),
              
              Text(
                'DATE & TIME',
                style: AppTextStyles.labelSmall.copyWith(color: AppColors.textSecondaryDark, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () async {
                  HapticFeedback.lightImpact();
                  final date = await showDatePicker(
                    context: ctx,
                    initialDate: selectedDate,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                    builder: (context, child) {
                      return Theme(
                        data: ThemeData.dark().copyWith(
                          colorScheme: const ColorScheme.dark(
                            primary: AppColors.primary,
                            onPrimary: Colors.white,
                            surface: AppColors.surfaceDark,
                            onSurface: AppColors.textPrimaryDark,
                          ),
                          dialogTheme: const DialogThemeData(backgroundColor: AppColors.surfaceDark),
                        ),
                        child: child!,
                      );
                    },
                  );
                  if (date != null) {
                    if (!ctx.mounted) return;
                    final time = await showTimePicker(
                      context: ctx,
                      initialTime: TimeOfDay.now(),
                      builder: (context, child) {
                        return Theme(
                          data: ThemeData.dark().copyWith(
                            colorScheme: const ColorScheme.dark(
                              primary: AppColors.primary,
                              onPrimary: Colors.white,
                              surface: AppColors.surfaceDark,
                              onSurface: AppColors.textPrimaryDark,
                            ),
                          ),
                          child: child!,
                        );
                      },
                    );
                    setSheetState(() {
                      selectedDate = DateTime(
                        date.year,
                        date.month,
                        date.day,
                        time?.hour ?? 0,
                        time?.minute ?? 0,
                      );
                    });
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today_rounded, color: AppColors.primaryLight, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          DateFormat('MMM d, yyyy – h:mm a').format(selectedDate),
                          style: AppTextStyles.titleMedium.copyWith(color: AppColors.textPrimaryDark),
                        ),
                      ),
                      const Icon(Icons.edit_rounded, color: AppColors.textSecondaryDark, size: 18),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 32),
              GradientButton(
                text: 'Create Event',
                icon: Icons.event_available_rounded,
                onPressed: () {
                  if (titleCtl.text.trim().isEmpty) return;
                  HapticFeedback.mediumImpact();
                  context.read<CalendarViewModel>().createEvent(
                        title: titleCtl.text.trim(),
                        description: descCtl.text.trim().isNotEmpty
                            ? descCtl.text.trim()
                            : null,
                        eventDate: selectedDate,
                        location: locationCtl.text.trim().isNotEmpty
                            ? locationCtl.text.trim()
                            : null,
                      );
                  Navigator.pop(ctx);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
