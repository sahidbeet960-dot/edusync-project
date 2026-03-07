import 'dart:async';
import 'package:flutter/material.dart';
import '../../../data/repositories/study_room_repository.dart';
import '../../../data/models/study_session_model.dart';

class Participant {
  final String username;
  final DateTime joinedAt;

  Participant({required this.username, required this.joinedAt});

  String get activeTime {
    final diff = DateTime.now().difference(joinedAt);
    final hours = diff.inHours;
    final mins = (diff.inMinutes % 60).toString().padLeft(2, '0');
    final secs = (diff.inSeconds % 60).toString().padLeft(2, '0');
    
    if (hours > 0) return '${hours.toString().padLeft(2, '0')}:$mins:$secs';
    return '$mins:$secs';
  }
}

class StudyRoomViewModel extends ChangeNotifier {
  final StudyRoomRepository _repo = StudyRoomRepository();

  bool _isConnected = false;
  String? _currentRoomId;
  String? _error;
  
  DateTime? _myJoinTime;
  String? _myUsername;
  final Map<String, Participant> _participants = {};
  
  Timer? _uiTicker;
  StreamSubscription? _messageSubscription;
  StudyStatsModel? _stats;

  bool get isConnected => _isConnected;
  String? get currentRoomId => _currentRoomId;
  String? get myUsername => _myUsername?.split('|').first;
  List<Participant> get participants => _participants.values.toList();
  String? get error => _error;
  StudyStatsModel? get stats => _stats;

  String get myActiveTime {
    if (_myJoinTime == null) return '00:00';
    final diff = DateTime.now().difference(_myJoinTime!);
    final hours = diff.inHours;
    final mins = (diff.inMinutes % 60).toString().padLeft(2, '0');
    final secs = (diff.inSeconds % 60).toString().padLeft(2, '0');
    if (hours > 0) return '${hours.toString().padLeft(2, '0')}:$mins:$secs';
    return '$mins:$secs';
  }

  // 1. Add 'int userId' to the parameters here ->
  Future<void> joinRoom(String roomId, String displayName, int userId) async {
    try {
      final sessionId = DateTime.now().millisecondsSinceEpoch.toString();
      _myUsername = '$displayName|$sessionId';
      _myJoinTime = DateTime.now();
      _participants.clear();
      
      // Subscribe to the message stream BEFORE connecting
      // so no broadcast messages (like room_state) are lost on Android
      _messageSubscription = _repo.messages.listen((msg) {
        final type = msg['type']?.toString().trim();

        print('WS MESSAGE RECEIVED: $msg');

        // 1. Initial connection loads active users from Redis
        if (type == 'room_state') {
          final users = msg['users'] as Map<String, dynamic>? ?? {};
          
          users.forEach((fullUsername, data) {
            if (fullUsername != _myUsername) {
              try {
                final displaySender = fullUsername.split('|').first.trim();
                final joinTimeSecs = (data['join_time'] as num).toInt();
                
                _participants[fullUsername] = Participant(
                  username: displaySender,
                  joinedAt: DateTime.fromMillisecondsSinceEpoch(joinTimeSecs * 1000),
                );
              } catch (_) {}
            }
          });
        } 
        // 2. Someone joins or leaves while we are in the room
        else if (type == 'system') {
          final rawSender = msg['username'] as String?;
          if (rawSender == null || rawSender == _myUsername) return;

          final displaySender = rawSender.split('|').first.trim();
          final action = msg['action']?.toString().trim();
          final message = msg['message']?.toString().trim();

          // Support both 'action' field and legacy 'message' field
          final isJoin = action == 'join' || message == 'joined the room';
          final isLeave = action == 'leave' || message == 'left the room';

          if (isJoin) {
            final rawTime = msg['join_time'];
            final joinTimeSecs = rawTime is num ? rawTime.toInt() : (DateTime.now().millisecondsSinceEpoch ~/ 1000);
            
            _participants[rawSender] = Participant(
              username: displaySender, 
              joinedAt: DateTime.fromMillisecondsSinceEpoch(joinTimeSecs * 1000),
            );
          } else if (isLeave) {
            _participants.remove(rawSender);
          }
        }
        
        notifyListeners();
      });

      // Now connect — any messages from the server will be caught by the listener above
      await _repo.connect(roomId, _myUsername!, userId);
      
      _isConnected = true;
      _currentRoomId = roomId;
      _error = null;

      _uiTicker = Timer.periodic(const Duration(seconds: 1), (_) {
        notifyListeners();
      });

      notifyListeners();
    } catch (e) {
      _error = 'Failed to join room: $e';
      notifyListeners();
    }
  }

  Future<void> leaveRoom() async {
    if (_currentRoomId != null && _myJoinTime != null) {
      final seconds = DateTime.now().difference(_myJoinTime!).inSeconds;
      if (seconds > 60) {
        try {
          await _repo.saveSession(
            roomId: _currentRoomId!,
            durationSeconds: seconds,
          );
        } catch (_) {}
      }
    }

    _uiTicker?.cancel();
    await _messageSubscription?.cancel();
    await _repo.disconnect();
    
    _isConnected = false;
    _currentRoomId = null;
    _myJoinTime = null;
    _participants.clear();
    notifyListeners();
  }

  @override
  void dispose() {
    _uiTicker?.cancel();
    _messageSubscription?.cancel();
    _repo.disconnect();
    super.dispose();
  }
}