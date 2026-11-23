"""Offline contract examples for the two publishable editions."""

import json
from pathlib import Path
import unittest

from jsonschema import Draft202012Validator


SCHEMA = Path(__file__).resolve().parents[1] / "docs/design/conversation-audio/release.schema.json"
SPEC = json.loads(SCHEMA.read_text(encoding="utf-8"))
VALIDATOR = Draft202012Validator(SPEC, format_checker=Draft202012Validator.FORMAT_CHECKER)


def recording(edition):
    scene, language, basis, take = "program-and-booklet", "en", "a" * 64, "take-01"
    directory = "https://res.cloudinary.com/dck5rzi4h/video/upload/v1/archive-dreams/audio/reviewed"
    entry = {
        "sceneId": scene, "edition": edition, "language": language,
        "basisRevision": basis, "takeId": take,
        "media": {
            "url": f"{directory}/{scene}/{edition}/{language}/{basis}/{take}.mp3",
            "mimeType": "audio/mpeg", "sha256": "b" * 64, "durationMs": 1800,
        },
    }
    if edition == "elevenlabs":
        entry["turnCues"] = [{"turnId": "t001", "speaker": "object:86.19.57", "startMs": 0, "endMs": 900}]
    if edition == "notebooklm":
        entry["sourceUrls"] = ["https://wolfsonian.org/_assets/docs/checklist_worlds-fairs.pdf"]
        entry["discussionTranscript"] = {
            "path": f"/demo/archive-society/audio-text/{scene}/{language}/{basis}/{take}.txt",
            "sha256": "c" * 64,
        }
    return entry


def valid(*entries):
    return VALIDATOR.is_valid({"schemaVersion": 1, "recordings": list(entries)})


class ConversationAudioReleaseTests(unittest.TestCase):
    def test_empty_single_and_paired_releases(self):
        Draft202012Validator.check_schema(SPEC)
        scene, discussion = recording("elevenlabs"), recording("notebooklm")
        for entries in [(), (scene,), (discussion,), (scene, discussion)]:
            with self.subTest(count=len(entries)):
                self.assertTrue(valid(*entries))

    def test_performance_can_play_without_unverified_highlights(self):
        scene = recording("elevenlabs")
        scene["turnCues"] = []
        self.assertTrue(valid(scene))
        scene["turnCues"] = [{"turnId": "t001", "speaker": "objectA", "startMs": 0, "endMs": 900}]
        self.assertFalse(valid(scene))

    def test_discussion_requires_its_own_transcript_and_sources(self):
        for field in ["discussionTranscript", "sourceUrls"]:
            with self.subTest(field=field):
                edition = recording("notebooklm")
                del edition[field]
                self.assertFalse(valid(edition))
        discussion = recording("notebooklm")
        discussion["turnCues"] = []
        self.assertFalse(valid(discussion))
        scene = recording("elevenlabs")
        scene["discussionTranscript"] = discussion["discussionTranscript"]
        self.assertFalse(valid(scene))

    def test_device_and_private_production_records_are_excluded(self):
        scene = recording("elevenlabs")
        scene["edition"] = "device"
        self.assertFalse(valid(scene))
        for field in ["providerVoiceId", "notebookUrl", "status"]:
            with self.subTest(field=field):
                self.assertFalse(valid({**recording("elevenlabs"), field: "private"}))

    def test_media_has_positive_duration_and_versioned_project_delivery(self):
        for before, after in [("/v1/", "/"), ("/video/", "/image/"), ("/reviewed/", "/private/")]:
            with self.subTest(fragment=before):
                scene = recording("elevenlabs")
                scene["media"]["url"] = scene["media"]["url"].replace(before, after)
                self.assertFalse(valid(scene))
        scene = recording("elevenlabs")
        scene["media"]["durationMs"] = 0
        self.assertFalse(valid(scene))
