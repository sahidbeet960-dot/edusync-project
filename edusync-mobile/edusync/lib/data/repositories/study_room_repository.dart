import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../models/study_session_model.dart';

class StudyRoomRepository {
  WebSocketChannel? _channel;
  final ApiClient _api = ApiClient();
  StreamController<Map<String, dynamic>>? _messageController;

  Stream<Map<String, dynamic>> get messages =>
      _messageController?.stream ?? const Stream.empty();

  /// Connect to WebSocket study room with username AND user_id
  Future<void> connect(String roomId, String username, int userId) async {
    final uri = Uri.parse(
      ApiConstants.studyRoomWs(roomId, username, userId),
    );

    _messageController = StreamController<Map<String, dynamic>>.broadcast();
    _channel = WebSocketChannel.connect(uri);

    // Wait for the WebSocket handshake to complete (critical on Android/native)
    try {
      await _channel!.ready;
    } catch (e) {
      _messageController?.addError(e);
      _messageController?.close();
      _channel = null;
      return;
    }

    _channel!.stream.listen(
      (data) {
        try {
          String textData;
          if (data is String) {
            textData = data;
          } else {
            textData = utf8.decode(data as List<int>);
          }
          final decoded = jsonDecode(textData);
          if (decoded is Map<String, dynamic>) {
            _messageController?.add(decoded);
          }
        } catch (_) {}
      },
      onError: (error) {
        _messageController?.addError(error);
      },
      onDone: () {
        _messageController?.close();
      },
    );
  }

  void sendMessage(Map<String, dynamic> message) {
    _channel?.sink.add(jsonEncode(message));
  }

  /// POST /api/v1/study/sessions — save a completed study session
  Future<void> saveSession({
    required String roomId,
    required int durationSeconds,
  }) async {
    await _api.post(
      ApiConstants.studySessions,
      data: {
        'room_id': roomId,
        'duration_seconds': durationSeconds,
      },
    );
  }

  /// GET /api/v1/study/my-stats — get personal study stats
  Future<StudyStatsModel> getMyStats() async {
    final response = await _api.get(ApiConstants.studyMyStats);
    return StudyStatsModel.fromJson(response.data);
  }

  Future<void> disconnect() async {
    // Send a proper close frame (code 1000 = normal closure)
    // so the backend's disconnect handler fires and removes user from Redis
    await _channel?.sink.close(1000, 'user_left');
    await _messageController?.close();
    _channel = null;
    _messageController = null;
  }
}